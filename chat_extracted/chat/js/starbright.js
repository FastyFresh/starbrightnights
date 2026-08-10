        const urlParams = new URLSearchParams(window.location.search);
        const urlVisitorId = urlParams.get('vid');
        
        let visitorId = urlVisitorId || localStorage.getItem('starbright_visitor_id');
        if (!visitorId) {
            visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        }
        localStorage.setItem('starbright_visitor_id', visitorId);
        
        let currentTier = 'free';
        let messagesUsed = 0;
        let monthlyLimit = 10;
        let selectedTier = 'vip';
        let isTyping = false;
        
        function leaveSite() {
            window.location.href = 'https://www.google.com';
        }
        
        function showAgeModal() {
            document.getElementById('age-modal').classList.add('active');
        }
        
        function hideAgeModal() {
            document.getElementById('age-modal').classList.remove('active');
        }
        
        async function verifyAge() {
            try {
                const response = await fetch('/api/chat/verify-age', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitor_id: visitorId,
                        confirmed_18_plus: true
                    })
                });
                
                if (response.ok) {
                    hideAgeModal();
                    document.getElementById('intro-screen').classList.remove('active');
                    document.getElementById('chat-screen').classList.add('active');
                    await initChat();
                }
            } catch (error) {
                console.error('Age verification failed:', error);
            }
        }
        
        async function checkAgeVerification() {
            try {
                const response = await fetch(`/api/chat/check-age/${visitorId}`);
                const data = await response.json();
                return data.verified;
            } catch (error) {
                return false;
            }
        }
        
        async function initChat() {
            await loadSubscriptionStatus();
            await loadChatHistory();
            updateMessageCounter();
            
            // Check if this is a returning user with history
            const messageCount = document.querySelectorAll('.message').length;
            if (messageCount === 0) {
                // New user - initialize session but don't auto-message
                await startNewChat();
                isFirstMessage = true;
            } else {
                // Returning user - skip the "brb" flow
                isFirstMessage = false;
            }
        }
        
        async function loadSubscriptionStatus() {
            try {
                const response = await fetch(`/api/chat/subscription/${visitorId}`);
                const data = await response.json();
                currentTier = data.tier || 'free';
                messagesUsed = data.messages_used || 0;
                
                const tierInfo = data.tier_info || {};
                monthlyLimit = tierInfo.monthly_messages || 20;
            } catch (error) {
                console.error('Failed to load subscription:', error);
            }
        }
        
        async function loadChatHistory() {
            try {
                const response = await fetch(`/api/chat/history/starbright_monroe/${visitorId}`);
                const data = await response.json();
                
                const messagesContainer = document.getElementById('chat-messages');
                messagesContainer.innerHTML = '';
                
                if (data.history && data.history.length > 0) {
                    data.history.forEach(msg => {
                        addMessageToChat(msg.content, msg.role === 'user', false);
                    });
                }
            } catch (error) {
                console.error('Failed to load history:', error);
            }
        }
        
        let isFirstMessage = true;
        
        async function startNewChat() {
            // Don't auto-message - wait for user to initiate
            // Just initialize the session silently
            try {
                await fetch('/api/chat/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        persona_id: 'starbright_monroe',
                        visitor_id: visitorId
                    })
                });
                isFirstMessage = true;
            } catch (error) {
                console.error('Failed to initialize chat:', error);
            }
        }
        
        async function handleFirstMessage() {
            // Show the "give me a second" flow when user sends first message
            showTypingIndicator();
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
            hideTypingIndicator();
            addMessageToChat("hi....can u give me one second? i'll b right back", false);
            
            showTypingIndicator();
            await new Promise(resolve => setTimeout(resolve, 8000 + Math.random() * 4000));
            hideTypingIndicator();
            addMessageToChat("ok I'm back 😊 sorry about that", false);
            isFirstMessage = false;
        }
        
        function addMessageToChat(content, isUser, animate = true) {
            const messagesContainer = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'from-user' : 'from-her'}`;
            if (!animate) messageDiv.style.animation = 'none';
            
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="message-bubble">${isUser ? escapeHtml(content) : linkifyText(content)}</div>
                <div class="message-time">${time}</div>`;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function addMediaToChat(mediaUrl, mediaType, caption, animate = true) {
            const messagesContainer = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message from-her';
            if (!animate) messageDiv.style.animation = 'none';
            
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let mediaHtml = '';
            if (mediaType === 'video') {
                mediaHtml = `<video src="${mediaUrl}" controls playsinline></video>`;
            } else {
                mediaHtml = `<img src="${mediaUrl}" alt="exclusive content" loading="lazy">`;
            }
            
            messageDiv.innerHTML = `
                <div class="message-bubble has-media">
                    <div class="message-media">
                        ${mediaHtml}
                    </div>
                    ${caption ? `<div class="message-media-caption">${escapeHtml(caption)}</div>` : ''}
                </div>
                <div class="message-time">${time}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTypingIndicator() {
            const messagesContainer = document.getElementById('chat-messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'message from-her';
            typingDiv.innerHTML = `
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            `;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function hideTypingIndicator() {
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }
        
        async function sendMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            
            if (!message || isTyping) return;
            
            if (currentTier === 'free' && messagesUsed >= monthlyLimit) {
                showUpsellBanner("sorry, to keep this fun going you'll need to upgrade 💕");
                return;
            }
            
            input.value = '';
            input.style.height = 'auto';
            addMessageToChat(message, true);
            
            isTyping = true;
            document.getElementById('send-btn').disabled = true;
            
            try {
                // First message gets the "brb" flow
                if (isFirstMessage) {
                    await handleFirstMessage();
                }
                
                messagesUsed++;
                updateMessageCounter();
                showTypingIndicator();
                
                const response = await fetch('/api/chat/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        persona_id: 'starbright_monroe',
                        visitor_id: visitorId,
                        message: message
                    })
                });
                
                const data = await response.json();
                
                const baseDelay = (data.typing_duration || 4) * 1000;
                const randomVariation = Math.random() * 4000 - 1000;
                const humanDelay = Math.max(3000, baseDelay + randomVariation);
                
                await new Promise(resolve => setTimeout(resolve, humanDelay));
                
                hideTypingIndicator();
                
                if (data.limit_reached) {
                    showUpsellBanner("sorry, to keep this fun going you'll need to upgrade 💕");
                } else if (data.response) {
                    addMessageToChat(data.response, false);
                    
                    if (currentTier === 'free' && messagesUsed >= 10 && messagesUsed % 5 === 0) {
                        setTimeout(() => showSoftUpsell(), 2000);
                    }
                }
                
                updateMessageCounter();
            } catch (error) {
                hideTypingIndicator();
                console.error('Send message failed:', error);
            } finally {
                isTyping = false;
                document.getElementById('send-btn').disabled = false;
            }
        }
        
        function updateMessageCounter() {
            const counter = document.getElementById('message-counter');
            
            if (currentTier === 'free') {
                const remaining = Math.max(0, monthlyLimit - messagesUsed);
                counter.textContent = `${remaining} free messages remaining`;
                counter.className = 'message-counter';
                
                if (remaining <= 5) {
                    counter.className = 'message-counter critical';
                } else if (remaining <= 10) {
                    counter.className = 'message-counter warning';
                }
            } else if (monthlyLimit === -1) {
                counter.textContent = 'VIP - Unlimited messages';
                counter.className = 'message-counter';
            } else {
                const remaining = Math.max(0, monthlyLimit - messagesUsed);
                counter.textContent = `${remaining} messages remaining`;
                counter.className = 'message-counter';
            }
        }
        
        function showUpsellBanner(text) {
            const banner = document.getElementById('upsell-banner');
            document.getElementById('upsell-text').textContent = text;
            banner.style.display = 'block';
        }
        
        function showSoftUpsell() {
            addMessageToChat("sorry, to keep this fun going you'll need to upgrade 💕", false);
        }
        
        function showSubscriptionModal() {
            document.getElementById('subscription-modal').classList.add('active');
        }
        
        function closeModal() {
            document.getElementById('subscription-modal').classList.remove('active');
        }
        
        function selectTier(tier) {
            selectedTier = tier;
            document.querySelectorAll('.tier-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.tier === tier);
            });
        }
        
        async function subscribe() {
            const btn = document.getElementById('subscribe-btn');
            btn.innerHTML = '<div class="loading-spinner"></div>';
            btn.disabled = true;
            
            try {
                const response = await fetch('/api/chat/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        persona_id: 'starbright_monroe',
                        visitor_id: visitorId,
                        tier_id: selectedTier
                    })
                });
                
                const data = await response.json();
                
                if (data.checkout_url) {
                    // Try to break out of iframe, fall back to new tab
                    try {
                        if (window.top !== window.self) {
                            window.top.location.href = data.checkout_url;
                        } else {
                            window.location.href = data.checkout_url;
                        }
                    } catch (e) {
                        // Cross-origin iframe - open in new tab
                        window.open(data.checkout_url, '_blank');
                    }
                } else {
                    throw new Error('No checkout URL');
                }
            } catch (error) {
                console.error('Subscribe failed:', error);
                btn.innerHTML = 'Upgrade Now';
                btn.disabled = false;
            }
        }
        
        async function loadWelcomePack() {
            try {
                const response = await fetch(`/api/chat/welcome-pack/${visitorId}?persona_id=starbright_monroe`);
                const data = await response.json();
                
                if (data.available && data.content && data.content.length > 0) {
                    addMessageToChat("omg you subscribed! 💕 here's a little welcome gift for you...", false);
                    
                    for (let i = 0; i < data.content.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        showTypingIndicator();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        hideTypingIndicator();
                        
                        const item = data.content[i];
                        addMediaToChat(item.url, item.type, item.message);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    addMessageToChat("hope you like them 😘 there's more coming...", false);
                }
            } catch (error) {
                console.error('Failed to load welcome pack:', error);
            }
        }
        
        async function checkForDripContent() {
            try {
                const response = await fetch(`/api/chat/next-drip/${visitorId}?persona_id=starbright_monroe`);
                const data = await response.json();
                
                if (data.available && data.url) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    showTypingIndicator();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    hideTypingIndicator();
                    addMediaToChat(data.url, data.type, data.message);
                }
            } catch (error) {
                console.error('Failed to check drip content:', error);
            }
        }
        
        function handleKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function linkifyText(text) {
            const escaped = escapeHtml(text);
            const urlPattern = /(https?:\/\/[^\s]+|(?:dfans\.co|onlyfans\.com|instagram\.com|twitter\.com|x\.com)\/[^\s]+)/gi;
            return escaped.replace(urlPattern, (url) => {
                const href = url.startsWith('http') ? url : `https://${url}`;
                return `<a href="${href}" target="_blank" rel="noopener" style="color: #ff6b9d; text-decoration: underline;">${url}</a>`;
            });
        }
        
        document.getElementById('chat-input').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        (async function init() {
            const isVerified = await checkAgeVerification();
            if (isVerified) {
                document.getElementById('intro-screen').classList.remove('active');
                document.getElementById('chat-screen').classList.add('active');
                await initChat();
                
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('subscribed') === 'true') {
                    window.history.replaceState({}, '', window.location.pathname);
                    setTimeout(() => loadWelcomePack(), 2000);
                } else if (currentTier !== 'free') {
                    setTimeout(() => checkForDripContent(), 5000);
                }
            }
        })();
