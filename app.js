// ===== Social Stable Coin App =====

class SocialStableCoin {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    // Default data structure
    getDefaultData() {
        return {
            balance: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalClaimed: 0,
            lastClaimDate: null,
            claimedDays: [],
            walletAddress: ''
        };
    }

    // Load data from localStorage
    loadData() {
        const saved = localStorage.getItem('ssc_data');
        if (saved) {
            return JSON.parse(saved);
        }
        return this.getDefaultData();
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('ssc_data', JSON.stringify(this.data));
    }

    // Initialize the app
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.checkStreak();
        this.updateUI();
        this.generateCalendar();
        this.checkClaimAvailability();
    }

    // Cache DOM elements
    cacheDOM() {
        this.totalBalanceEl = document.getElementById('totalBalance');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.multiplierBadgeEl = document.getElementById('multiplierBadge');
        this.progressFillEl = document.getElementById('progressFill');
        this.rewardAmountEl = document.getElementById('rewardAmount');
        this.bonusTextEl = document.getElementById('bonusText');
        this.claimBtnEl = document.getElementById('claimBtn');
        this.cooldownTimerEl = document.getElementById('cooldownTimer');
        this.timerValueEl = document.getElementById('timerValue');
        this.calendarGridEl = document.getElementById('calendarGrid');
        this.walletAddressEl = document.getElementById('walletAddress');
        this.saveAddressBtnEl = document.getElementById('saveAddressBtn');
        this.totalClaimedEl = document.getElementById('totalClaimed');
        this.bestStreakEl = document.getElementById('bestStreak');
        this.currentMultiplierEl = document.getElementById('currentMultiplier');
        this.toastEl = document.getElementById('toast');
        this.toastMessageEl = document.getElementById('toastMessage');
        this.confettiContainerEl = document.getElementById('confettiContainer');
        this.mainCoinEl = document.getElementById('mainCoin');
        this.particlesEl = document.getElementById('particles');
    }

    // Bind event listeners
    bindEvents() {
        this.claimBtnEl.addEventListener('click', () => this.claim());
        this.saveAddressBtnEl.addEventListener('click', () => this.saveAddress());
        this.mainCoinEl.addEventListener('click', () => this.coinClick());
        
        // Social share buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', () => this.shareOnSocial(btn));
        });
    }

    // Get today's date string
    getTodayString() {
        return new Date().toDateString();
    }

    // Check and update streak
    checkStreak() {
        const today = this.getTodayString();
        const lastClaim = this.data.lastClaimDate;

        if (!lastClaim) {
            return; // No previous claims
        }

        const lastDate = new Date(lastClaim);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If more than 1 day has passed, reset streak
        if (diffDays > 1) {
            this.data.currentStreak = 0;
            this.saveData();
        }
    }

    // Calculate multiplier based on streak
    getMultiplier() {
        const streak = this.data.currentStreak;
        if (streak >= 100) return 5;
        if (streak >= 30) return 3;
        if (streak >= 7) return 2;
        return 1;
    }

    // Calculate base reward based on tier
    getBaseReward() {
        const streak = this.data.currentStreak;
        if (streak >= 100) return 100;
        if (streak >= 30) return 50;
        if (streak >= 7) return 25;
        return 10;
    }

    // Get total reward with multiplier
    getTotalReward() {
        return this.getBaseReward() * this.getMultiplier();
    }

    // Check if claim is available
    checkClaimAvailability() {
        const today = this.getTodayString();
        const canClaim = this.data.lastClaimDate !== today;

        if (canClaim) {
            this.claimBtnEl.disabled = false;
            this.cooldownTimerEl.style.display = 'none';
        } else {
            this.claimBtnEl.disabled = true;
            this.cooldownTimerEl.style.display = 'block';
            this.startCooldownTimer();
        }
    }

    // Start cooldown timer
    startCooldownTimer() {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            this.timerValueEl.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    // Claim reward
    claim() {
        const today = this.getTodayString();
        
        if (this.data.lastClaimDate === today) {
            this.showToast('Already claimed today! 🕐');
            return;
        }

        // Update streak
        const lastClaim = this.data.lastClaimDate;
        if (lastClaim) {
            const lastDate = new Date(lastClaim);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day - increase streak
                this.data.currentStreak++;
            } else {
                // Streak broken - start fresh
                this.data.currentStreak = 1;
            }
        } else {
            // First claim ever
            this.data.currentStreak = 1;
        }

        // Calculate reward
        const reward = this.getTotalReward();
        
        // Update data
        this.data.balance += reward;
        this.data.totalClaimed += reward;
        this.data.lastClaimDate = today;
        this.data.claimedDays.push(today);
        
        // Update best streak
        if (this.data.currentStreak > this.data.bestStreak) {
            this.data.bestStreak = this.data.currentStreak;
        }

        this.saveData();
        
        // Visual feedback
        this.animateClaim();
        this.createConfetti();
        this.showToast(`+${reward} SSC claimed! 🎉`);
        
        // Update UI
        this.updateUI();
        this.generateCalendar();
        this.checkClaimAvailability();
    }

    // Animate coin on claim
    animateClaim() {
        this.mainCoinEl.style.animation = 'none';
        this.mainCoinEl.offsetHeight; // Trigger reflow
        this.mainCoinEl.style.animation = 'coin-claim 0.5s ease';
        
        // Create particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('span');
            particle.classList.add('particle');
            particle.textContent = '🪙';
            particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
            particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);
            this.particlesEl.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // Coin click animation
    coinClick() {
        this.mainCoinEl.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.mainCoinEl.style.transform = 'scale(1)';
        }, 100);
    }

    // Create confetti
    createConfetti() {
        const colors = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#F59E0B', '#06B6D4'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                this.confettiContainerEl.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    // Update UI elements
    updateUI() {
        // Balance
        this.totalBalanceEl.textContent = this.data.balance.toFixed(2);
        
        // Streak
        this.currentStreakEl.textContent = this.data.currentStreak;
        
        // Multiplier
        const multiplier = this.getMultiplier();
        this.multiplierBadgeEl.textContent = `${multiplier}x`;
        this.currentMultiplierEl.textContent = `${multiplier}x`;
        
        // Progress bar
        const progress = Math.min((this.data.currentStreak / 100) * 100, 100);
        this.progressFillEl.style.width = `${progress}%`;
        
        // Update milestones
        this.updateMilestones();
        
        // Reward preview
        this.rewardAmountEl.textContent = this.getBaseReward();
        if (multiplier > 1) {
            this.bonusTextEl.textContent = `🔥 ${multiplier}x Streak Bonus!`;
        } else {
            this.bonusTextEl.textContent = '';
        }
        
        // Stats
        this.totalClaimedEl.textContent = this.data.totalClaimed;
        this.bestStreakEl.textContent = this.data.bestStreak;
        
        // Wallet address
        if (this.data.walletAddress) {
            this.walletAddressEl.value = this.data.walletAddress;
        }
    }

    // Update milestone icons
    updateMilestones() {
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(milestone => {
            const day = parseInt(milestone.dataset.day);
            const icon = milestone.querySelector('.milestone-icon');
            if (this.data.currentStreak >= day) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }

    // Generate calendar
    generateCalendar() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        this.calendarGridEl.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateString = date.toDateString();
            
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');
            
            const isToday = dateString === this.getTodayString();
            const isClaimed = this.data.claimedDays.includes(dateString);
            
            if (isToday) dayEl.classList.add('today');
            if (isClaimed) dayEl.classList.add('claimed');
            
            dayEl.innerHTML = `
                <span class="day-name">${days[i]}</span>
                <span class="check-mark">${isClaimed ? '✅' : (date <= today ? '⬜' : '🔲')}</span>
            `;
            
            this.calendarGridEl.appendChild(dayEl);
        }
    }

    // Save wallet address
    saveAddress() {
        const address = this.walletAddressEl.value.trim();
        
        if (!address) {
            this.showToast('Please enter an address! ⚠️');
            return;
        }
        
        if (!address.startsWith('0x') || address.length !== 42) {
            this.showToast('Invalid address format! ❌');
            return;
        }
        
        this.data.walletAddress = address;
        this.saveData();
        this.showToast('Address saved! ✅');
    }

    // Share on social media
    shareOnSocial(btn) {
        const message = `🔥 I'm on a ${this.data.currentStreak} day streak on Social Stable Coin! 🪙\n\nJoin me and earn daily $SSC rewards! No wallet connection needed! 🚀\n\n#SocialStableCoin #SSC #CryptoGains`;
        
        if (btn.classList.contains('twitter-btn')) {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            this.showToast('Share link copied! 📋');
        }
        
        // Bonus for sharing
        this.data.balance += 5;
        this.saveData();
        this.updateUI();
        this.showToast('+5 SSC sharing bonus! 🎁');
    }

    // Show toast notification
    showToast(message) {
        this.toastMessageEl.textContent = message;
        this.toastEl.classList.add('show');
        
        setTimeout(() => {
            this.toastEl.classList.remove('show');
        }, 3000);
    }
}

// Add coin claim animation
const style = document.createElement('style');
style.textContent = `
    @keyframes coin-claim {
        0% { transform: scale(1); }
        25% { transform: scale(1.2) rotate(-10deg); }
        50% { transform: scale(0.9) rotate(10deg); }
        75% { transform: scale(1.1) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
`;
document.head.appendChild(style);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.ssc = new SocialStableCoin();
});
