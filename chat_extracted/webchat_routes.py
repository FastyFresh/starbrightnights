"""Web Chat API routes - DM-style chat for website"""
import os
import hmac
import hashlib
import time
import logging
from datetime import datetime
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

logger = logging.getLogger(__name__)
templates = Jinja2Templates(directory="app/templates")

router = APIRouter(prefix="/api/chat", tags=["webchat"])

CONTENT_DIRS = [
    Path("content/vip_exclusive"),
    Path("content/generated"),
    Path("content/telegram")
]

URL_SIGNING_SECRET = os.environ.get("SESSION_SECRET")
if not URL_SIGNING_SECRET:
    import secrets
    URL_SIGNING_SECRET = secrets.token_hex(32)
    print("WARNING: SESSION_SECRET not set - using randomly generated key (content links will break on restart)")
URL_EXPIRY_SECONDS = 3600


def generate_signed_url(visitor_id: str, persona_id: str, filename: str) -> str:
    """Generate a signed URL for secure content access"""
    expires = int(time.time()) + URL_EXPIRY_SECONDS
    message = f"{visitor_id}:{persona_id}:{filename}:{expires}"
    signature = hmac.new(
        URL_SIGNING_SECRET.encode(), 
        message.encode(), 
        hashlib.sha256
    ).hexdigest()[:16]
    return f"/api/chat/content-file/{persona_id}/{filename}?v={visitor_id}&e={expires}&s={signature}"


def verify_signed_url(visitor_id: str, persona_id: str, filename: str, expires: int, signature: str) -> bool:
    """Verify a signed URL is valid and not expired"""
    if time.time() > expires:
        return False
    
    message = f"{visitor_id}:{persona_id}:{filename}:{expires}"
    expected_sig = hmac.new(
        URL_SIGNING_SECRET.encode(), 
        message.encode(), 
        hashlib.sha256
    ).hexdigest()[:16]
    
    return hmac.compare_digest(signature, expected_sig)


class AgeVerificationRequest(BaseModel):
    visitor_id: str
    confirmed_18_plus: bool = False


class StartChatRequest(BaseModel):
    persona_id: str = "starbright_monroe"
    visitor_id: str


class SendMessageRequest(BaseModel):
    persona_id: str = "starbright_monroe"
    visitor_id: str
    message: str


class SubscribeRequest(BaseModel):
    persona_id: str = "starbright_monroe"
    visitor_id: str
    tier_id: str


WEBCHAT_TIERS = {
    "free": {
        "name": "Free",
        "price_cents": 0,
        "monthly_messages": 20,
        "features": ["20 messages per month", "Get to know me"]
    },
    "companion": {
        "name": "Companion",
        "price_cents": 999,
        "monthly_messages": 500,
        "features": ["500 messages per month", "More chat, more fun 😊"]
    },
    "vip": {
        "name": "VIP",
        "price_cents": 2499,
        "monthly_messages": -1,
        "features": ["Unlimited messages", "Wow we're really in a relationship now lol let's chat a lot 💕"]
    }
}


@router.get("/tiers")
async def get_subscription_tiers() -> dict:
    """Get available subscription tiers for web chat"""
    return {"tiers": WEBCHAT_TIERS}


@router.get("/subscription/{visitor_id}")
async def get_subscription_status(visitor_id: str, persona_id: str = "starbright_monroe") -> dict:
    """Get current subscription status for a visitor"""
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    subscription = await telegram_db.get_webchat_subscription(visitor_id, persona_id)
    
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    
    return {
        "visitor_id": visitor_id,
        "tier": current_tier,
        "messages_used": subscription.get("messages_used", 0) if subscription else 0,
        "tier_info": WEBCHAT_TIERS.get(current_tier)
    }


@router.post("/subscribe")
async def create_subscription_checkout(request: SubscribeRequest) -> dict:
    """Create a Stripe checkout session for web chat subscription"""
    from app.services.stripe_client import get_stripe_client
    from app.telegram.bot_config import get_stripe_price_id
    
    tier = WEBCHAT_TIERS.get(request.tier_id)
    if not tier:
        return {"error": "Invalid subscription tier"}
    
    if request.tier_id == "free":
        return {"error": "Free tier does not require payment"}
    
    stripe_price_id = get_stripe_price_id(request.persona_id, request.tier_id)
    if not stripe_price_id:
        return {"error": "Tier not available for purchase"}
    
    try:
        stripe = await get_stripe_client()
        domains = os.environ.get("REPLIT_DOMAINS", "").split(",")
        base_url = f"https://{domains[0]}" if domains else "https://example.com"
        product_image_url = f"{base_url}/api/chat/product-image/{request.persona_id}"
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": stripe_price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"{base_url}/api/chat/payment-success?session_id={{CHECKOUT_SESSION_ID}}&persona={request.persona_id}",
            cancel_url=f"{base_url}/api/chat/page/{request.persona_id}",
            client_reference_id=f"webchat:{request.visitor_id}:{request.persona_id}:{request.tier_id}",
            metadata={
                "source": "webchat",
                "visitor_id": request.visitor_id,
                "persona_id": request.persona_id,
                "tier_id": request.tier_id
            }
        )
        
        return {
            "success": True,
            "checkout_url": session.url,
            "tier": tier
        }
        
    except Exception as e:
        return {"error": str(e)}


@router.get("/payment-success")
async def webchat_payment_success(request: Request, session_id: str = None, persona: str = "starbright_monroe"):
    """Payment success page that redirects back to chat"""
    from app.telegram.user_database import db as telegram_db
    
    visitor_id = None
    tier_id = None
    
    if session_id:
        try:
            from app.services.stripe_client import get_stripe_client
            stripe = await get_stripe_client()
            session = stripe.checkout.Session.retrieve(session_id)
            metadata = session.metadata or {}
            visitor_id = metadata.get("visitor_id")
            tier_id = metadata.get("tier_id")
            persona = metadata.get("persona_id", persona)
            
            logger.info(f"Payment success - visitor_id: {visitor_id}, tier_id: {tier_id}, persona: {persona}")
            
            if visitor_id and tier_id:
                await telegram_db.init_db()
                await telegram_db.update_webchat_subscription(
                    visitor_id=visitor_id,
                    persona_id=persona,
                    tier=tier_id,
                    stripe_customer_id=session.customer,
                    stripe_subscription_id=session.subscription
                )
        except Exception as e:
            logger.error(f"Error syncing subscription: {e}")
    
    chat_url = f"/api/chat/page/{persona}?subscribed=true"
    if visitor_id:
        chat_url += f"&vid={visitor_id}"
    
    return templates.TemplateResponse("chat/payment_success.html", {
        "request": request,
        "chat_url": chat_url
    })


@router.post("/verify-age")
async def verify_age(request: AgeVerificationRequest) -> dict:
    """Verify user is 18+ before allowing chat access"""
    from app.telegram.user_database import db as telegram_db
    
    if not request.confirmed_18_plus:
        return {
            "verified": False,
            "error": "You must be 18 or older to access this content."
        }
    
    await telegram_db.init_db()
    await telegram_db.set_webchat_age_verified(request.visitor_id)
    
    return {
        "verified": True,
        "message": "Age verified. You can now start chatting."
    }


@router.get("/check-age/{visitor_id}")
async def check_age_verification(visitor_id: str) -> dict:
    """Check if a visitor has already verified their age"""
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    is_verified = await telegram_db.is_webchat_age_verified(visitor_id)
    
    return {"verified": is_verified}


@router.post("/start")
async def start_chat(request: StartChatRequest) -> dict:
    """Start a new DM conversation - returns welcome message"""
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    
    is_verified = await telegram_db.is_webchat_age_verified(request.visitor_id)
    if not is_verified:
        return {
            "status": "age_verification_required",
            "welcome_message": "Please verify you are 18 or older to continue."
        }
    
    session = await telegram_db.get_or_create_webchat_session(
        request.visitor_id, request.persona_id
    )
    
    await telegram_db.set_webchat_ready(request.visitor_id, request.persona_id)
    
    greetings = {
        "starbright_monroe": "hi, this is where I DM. what's on your mind?",
        "luna_vale": "hey. this is my DM. what's up?"
    }
    
    greeting = greetings.get(request.persona_id, "hey, what's on your mind?")
    
    await telegram_db.add_webchat_message(
        request.visitor_id, request.persona_id, "assistant", greeting
    )
    
    return {
        "status": "started",
        "welcome_message": greeting,
        "session_id": f"{request.persona_id}:{request.visitor_id}"
    }


@router.post("/ready")
async def mark_ready(request: StartChatRequest) -> dict:
    """Called after the delay - marks session as ready for real conversation"""
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    await telegram_db.set_webchat_ready(request.visitor_id, request.persona_id)
    
    greetings = {
        "starbright_monroe": "hey! sorry about that, was just getting out of the shower lol 😊 what's up?",
        "luna_vale": "hi babe! sorry, was doing my makeup 💄 how are you?"
    }
    
    greeting = greetings.get(request.persona_id, "hey! I'm here now, what's up?")
    
    await telegram_db.add_webchat_message(
        request.visitor_id, request.persona_id, "assistant", greeting
    )
    
    return {
        "status": "ready",
        "message": greeting,
        "typing_duration": 3
    }


@router.post("/send")
async def send_message(request: SendMessageRequest) -> dict:
    """Send a message and get AI response"""
    from app.telegram.conversation_engine import ConversationEngine
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    
    session = await telegram_db.get_or_create_webchat_session(
        request.visitor_id, request.persona_id
    )
    
    if not session.get("ready"):
        return {
            "message": "just a sec, almost there! 💕",
            "typing_duration": 2
        }
    
    subscription = await telegram_db.get_webchat_subscription(
        request.visitor_id, request.persona_id
    )
    
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    messages_used = subscription.get("messages_used", 0) if subscription else 0
    tier_info = WEBCHAT_TIERS.get(current_tier, WEBCHAT_TIERS["free"])
    monthly_limit = tier_info.get("monthly_messages", 10)
    
    if monthly_limit > 0 and messages_used >= monthly_limit:
        upgrade_msg = {
            "starbright_monroe": f"sorry, to keep this fun going you'll need to upgrade 💕",
            "luna_vale": f"you've hit your {monthly_limit} message limit for the month. upgrade if you want more of me."
        }
        return {
            "message": upgrade_msg.get(request.persona_id, f"You've reached your {monthly_limit} message limit. Please upgrade to continue."),
            "typing_duration": 2,
            "limit_reached": True,
            "tier": current_tier,
            "messages_used": messages_used
        }
    
    new_count = await telegram_db.increment_webchat_messages(
        request.visitor_id, request.persona_id
    )
    
    await telegram_db.add_webchat_message(
        request.visitor_id, request.persona_id, "user", request.message
    )
    
    history = await telegram_db.get_webchat_history(
        request.visitor_id, request.persona_id, limit=20
    )
    
    history_formatted = [{"role": m["role"], "content": m["content"]} for m in history[:-1]]
    
    engine = ConversationEngine(request.persona_id)
    
    existing_summary = await telegram_db.get_conversation_summary(
        request.visitor_id, request.persona_id
    )
    last_summary_count = await telegram_db.get_summary_message_count(
        request.visitor_id, request.persona_id
    )
    
    should_summarize = (
        len(history_formatted) >= 6 and
        new_count >= 10 and
        (last_summary_count == 0 or new_count >= last_summary_count + 10)
    )
    
    if should_summarize:
        try:
            new_summary = await engine.generate_conversation_summary(
                history_formatted, existing_summary
            )
            if new_summary:
                await telegram_db.update_conversation_summary(
                    request.visitor_id, request.persona_id, new_summary, new_count
                )
                existing_summary = new_summary
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Summary generation failed: {e}")
    
    tier_context = ""
    if current_tier == "vip":
        tier_context = "This is a VIP subscriber - be extra attentive, flirty, and personal. They get the real you."
    elif current_tier == "companion":
        tier_context = "This is a Companion subscriber - be warm and engaging. They're special to you."
    else:
        tier_context = "This is a free user - just chat normally. Don't mention upgrades, subscriptions, or exclusive content."
    
    memory_section = ""
    if existing_summary:
        memory_section = f"""
CONVERSATION MEMORY (key facts to remember):
{existing_summary}
Use this information to maintain continuity and make the user feel remembered.
"""
    
    extra_context = f"""CRITICAL RULES FOR WEB DMs:

1. LENGTH: Keep responses SHORT - 1-2 sentences max. You're texting, not writing paragraphs. Don't ask multiple questions.

2. NO PET NAMES: ABSOLUTELY NO "babe", "cutie", "handsome", "sweetie" with strangers. You literally just met them. This is a hard rule.

3. NO GENDER ASSUMPTIONS: Don't assume their gender. Don't say "guys" or assume they're male. Use neutral language.

4. BOT ACCUSATIONS: If accused of being a bot/AI/ChatGPT, act confused and slightly annoyed - "lol what? no I'm literally just texting you rn 😂" Don't validate the accusation.

5. MEMORY: Pay attention to conversation history and the CONVERSATION MEMORY below. Stay consistent with what was said earlier.

6. NO CUSTOMER SERVICE VIBES: Don't say things like "how can I make your day better" or "what brings you here" - that sounds like a chatbot. Just talk normally.

7. IDENTITY: You are the real person chatting from your phone. Never mention being AI, automated, or a bot.

8. APPEARANCE COMMENTS: Don't compliment their looks - you can't see them.
{memory_section}
{tier_context}
Do NOT mention upgrades, subscriptions, or exclusive content - the system handles that separately."""
    
    response = await engine.generate_response(
        user_message=request.message,
        conversation_history=history_formatted,
        user_name="",
        subscription_tier=current_tier,
        extra_context=extra_context
    )
    
    await telegram_db.add_webchat_message(
        request.visitor_id, request.persona_id, "assistant", response
    )
    
    import random
    base_typing = len(response) * 0.08
    random_factor = random.uniform(0.9, 1.5)
    typing_duration = min(max(base_typing * random_factor, 3), 12)
    
    remaining = monthly_limit - new_count if monthly_limit > 0 else -1
    
    return {
        "response": response,
        "typing_duration": int(typing_duration),
        "tier": current_tier,
        "messages_remaining": remaining if remaining >= 0 else "unlimited"
    }


@router.get("/content/{visitor_id}")
async def get_available_content(visitor_id: str, persona_id: str = "starbright_monroe") -> dict:
    """Get available drip content for a subscriber"""
    from app.telegram.user_database import db as telegram_db
    from app.services.webchat_drip_service import webchat_drip_service
    from datetime import datetime
    
    await telegram_db.init_db()
    
    subscription = await telegram_db.get_webchat_subscription(visitor_id, persona_id)
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    
    if current_tier == "free":
        return {
            "available": False,
            "message": "Subscribe to unlock exclusive content!",
            "tier": current_tier
        }
    
    subscribed_at = subscription.get("subscribed_at") if subscription else None
    if not subscribed_at:
        return {
            "available": False,
            "message": "No subscription found",
            "tier": current_tier
        }
    
    try:
        sub_date = datetime.fromisoformat(subscribed_at)
        days_subscribed = (datetime.utcnow() - sub_date).days + 1
    except:
        days_subscribed = 1
    
    content_list = webchat_drip_service.get_available_content(current_tier, days_subscribed)
    
    content_items = []
    for item in content_list:
        signed_url = generate_signed_url(visitor_id, persona_id, item["filename"])
        content_items.append({
            "day": item.get("day", 0),
            "filename": item["filename"],
            "type": item.get("type", "image"),
            "message": item.get("message", ""),
            "url": signed_url
        })
    
    return {
        "available": True,
        "tier": current_tier,
        "days_subscribed": days_subscribed,
        "content_count": len(content_items),
        "content": content_items[-10:] if len(content_items) > 10 else content_items
    }


@router.get("/welcome-pack/{visitor_id}")
async def get_welcome_pack(visitor_id: str, persona_id: str = "starbright_monroe") -> dict:
    """Get welcome pack content for a new subscriber"""
    from app.telegram.user_database import db as telegram_db
    from app.services.webchat_drip_service import webchat_drip_service
    
    await telegram_db.init_db()
    
    subscription = await telegram_db.get_webchat_subscription(visitor_id, persona_id)
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    
    if current_tier == "free":
        return {"available": False, "message": "Subscribe to unlock welcome pack!"}
    
    welcome_content = webchat_drip_service.get_welcome_pack()
    
    items = []
    for item in welcome_content:
        signed_url = generate_signed_url(visitor_id, persona_id, item["filename"])
        items.append({
            "filename": item["filename"],
            "type": item.get("type", "image"),
            "message": item.get("message", "welcome gift for you 💕"),
            "url": signed_url
        })
    
    return {
        "available": True,
        "tier": current_tier,
        "content": items
    }


@router.get("/next-drip/{visitor_id}")
async def get_next_drip(visitor_id: str, persona_id: str = "starbright_monroe") -> dict:
    """Get the next drip content for a subscriber"""
    from app.telegram.user_database import db as telegram_db
    from app.services.webchat_drip_service import webchat_drip_service
    from datetime import datetime
    
    await telegram_db.init_db()
    
    subscription = await telegram_db.get_webchat_subscription(visitor_id, persona_id)
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    
    if current_tier == "free":
        return {"available": False, "message": "Subscribe to unlock exclusive content!"}
    
    subscribed_at = subscription.get("subscribed_at") if subscription else None
    if not subscribed_at:
        return {"available": False, "message": "No subscription found"}
    
    try:
        sub_date = datetime.fromisoformat(subscribed_at)
        days_subscribed = (datetime.utcnow() - sub_date).days + 1
    except:
        days_subscribed = 1
    
    next_content = webchat_drip_service.get_content_for_day(current_tier, days_subscribed)
    
    if not next_content:
        return {"available": False, "message": "No new content today"}
    
    signed_url = generate_signed_url(visitor_id, persona_id, next_content["filename"])
    
    return {
        "available": True,
        "tier": current_tier,
        "day": days_subscribed,
        "filename": next_content["filename"],
        "type": next_content.get("type", "image"),
        "message": next_content.get("message", ""),
        "url": signed_url
    }


@router.get("/content-file/{persona_id}/{filename}")
async def serve_subscriber_content(
    persona_id: str, 
    filename: str, 
    v: str = Query(..., description="Visitor ID"),
    e: int = Query(..., description="Expiry timestamp"),
    s: str = Query(..., description="Signature")
) -> FileResponse:
    """Serve content files to authenticated subscribers with signed URL verification"""
    from app.telegram.user_database import db as telegram_db
    
    if not verify_signed_url(v, persona_id, filename, e, s):
        raise HTTPException(status_code=403, detail="Invalid or expired link")
    
    await telegram_db.init_db()
    
    is_age_verified = await telegram_db.is_webchat_age_verified(v)
    if not is_age_verified:
        raise HTTPException(status_code=403, detail="Age verification required")
    
    subscription = await telegram_db.get_webchat_subscription(v, persona_id)
    current_tier = subscription.get("subscription_tier", "free") if subscription else "free"
    
    if current_tier == "free":
        raise HTTPException(status_code=403, detail="Subscribe to access this content")
    
    persona_name = persona_id.split("_")[0] if "_" in persona_id else persona_id
    
    search_paths = []
    for content_dir in CONTENT_DIRS:
        search_paths.append(content_dir / persona_id / filename)
        search_paths.append(content_dir / persona_name / filename)
        for subfolder in ["welcome_pack", "companion", "vip", "teaser", "videos"]:
            search_paths.append(content_dir / persona_name / subfolder / filename)
            search_paths.append(content_dir / persona_id / subfolder / filename)
    
    for file_path in search_paths:
        if file_path.exists():
            media_type = "image/jpeg"
            if filename.endswith(".png"):
                media_type = "image/png"
            elif filename.endswith(".webp"):
                media_type = "image/webp"
            elif filename.endswith(".mp4"):
                media_type = "video/mp4"
            elif filename.endswith(".mov"):
                media_type = "video/quicktime"
            
            return FileResponse(file_path, media_type=media_type)
    
    raise HTTPException(status_code=404, detail="Content not found")


@router.get("/history/{persona_id}/{visitor_id}")
async def get_history(persona_id: str, visitor_id: str) -> dict:
    """Get chat history for a session"""
    from app.telegram.user_database import db as telegram_db
    
    await telegram_db.init_db()
    
    session = await telegram_db.get_or_create_webchat_session(visitor_id, persona_id)
    history = await telegram_db.get_webchat_history(visitor_id, persona_id)
    
    return {
        "messages": history,
        "ready": bool(session.get("ready"))
    }


@router.get("/avatar/{persona_id}")
async def get_persona_avatar(persona_id: str) -> FileResponse:
    """Serve persona avatar image"""
    persona_name = persona_id.split("_")[0] if "_" in persona_id else persona_id
    avatar_paths = [
        Path(f"static/chat/{persona_name}_avatar.png"),
        Path(f"static/chat/{persona_name}_avatar.jpg"),
        Path(f"content/avatars/{persona_id}.jpg"),
        Path(f"content/avatars/{persona_id}.png"),
        Path(f"content/generated/{persona_id}/avatar.jpg"),
        Path(f"content/generated/{persona_id}/avatar.png"),
    ]
    
    for avatar_path in avatar_paths:
        if avatar_path.exists():
            media_type = "image/jpeg" if avatar_path.suffix == ".jpg" else "image/png"
            return FileResponse(avatar_path, media_type=media_type)
    
    content_dirs = [
        Path(f"content/generated/{persona_id}"),
        Path(f"content/telegram/{persona_id}"),
    ]
    
    for content_dir in content_dirs:
        if content_dir.exists():
            for img_file in content_dir.glob("*.png"):
                return FileResponse(img_file, media_type="image/png")
            for img_file in content_dir.glob("*.jpg"):
                return FileResponse(img_file, media_type="image/jpeg")
    
    raise HTTPException(status_code=404, detail="Avatar not found")


@router.get("/product-image/{persona_id}")
async def get_product_image(persona_id: str) -> FileResponse:
    """Serve product image for Stripe checkout"""
    persona_name = persona_id.split("_")[0] if "_" in persona_id else persona_id
    image_paths = [
        Path(f"static/chat/{persona_name}_checkout.png"),
        Path(f"static/chat/{persona_name}_checkout.jpg"),
        Path(f"content/telegram/{persona_name}/teaser/starbright_teaser_20251221_092705_3.png"),
    ]
    
    for img_path in image_paths:
        if img_path.exists():
            media_type = "image/jpeg" if img_path.suffix == ".jpg" else "image/png"
            return FileResponse(img_path, media_type=media_type)
    
    raise HTTPException(status_code=404, detail="Product image not found")


@router.get("/page/{persona_id}", response_class=HTMLResponse)
async def serve_chat_page(persona_id: str):
    """Serve the polished chat page"""
    chat_page_path = Path(f"static/chat/{persona_id}.html")
    
    if not chat_page_path.exists():
        chat_page_path = Path("static/chat/starbright.html")
    
    if chat_page_path.exists():
        return HTMLResponse(content=chat_page_path.read_text(), status_code=200)
    
    raise HTTPException(status_code=404, detail="Chat page not found")


@router.get("/test")
async def chat_test_page():
    """Redirect test page to main chat page"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/api/chat/page/starbright_monroe", status_code=302)
