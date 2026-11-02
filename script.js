
/* =========================
   GLOBAL
   ========================= */

const cards = Array.from(document.querySelectorAll(".card"));
const gallery = document.querySelector(".gallery");

const mobileQuery = window.matchMedia("(max-width: 768px)");

let activeCard = null;
let closeTimer = null;

/* =========================
   VIDEO COVERS
   ========================= */

cards.forEach(function(card) {

    const video = card.querySelector("video");

    video.addEventListener("loadedmetadata", function() {
        if (video.duration > 0.1) {
            video.currentTime = 0.1;
        }
    }, { once: true });

});

/* =========================
   OPEN / CLOSE VIDEO
   ========================= */

function openCard(card) {

    if (activeCard) return;

    clearTimeout(closeTimer);

    const video = card.querySelector("video");

    // 电脑端：记录漂浮卡片当前位置
    if (!mobileQuery.matches) {

        const rect = card.getBoundingClientRect();

        card.style.animation = "none";
        card.style.position = "fixed";
        card.style.top = rect.top + "px";
        card.style.left = rect.left + "px";
        card.style.transform = "none";

        card.getBoundingClientRect();
    }

    card.classList.add("expanded");
    gallery.classList.add("has-active");

    if (!mobileQuery.matches) {
        card.style.top = "";
        card.style.left = "";
        card.style.transform = "";
    }

    activeCard = card;

    video.currentTime = 0;
    video.muted = false;

    video.play().catch(function() {
        // 浏览器可能阻止自动播放
    });
}

function closeCard() {

    if (!activeCard) return;

    const card = activeCard;
    const video = card.querySelector("video");

    video.pause();
    video.muted = true;

    card.classList.remove("expanded");
    gallery.classList.remove("has-active");

    activeCard = null;

    clearTimeout(closeTimer);

    if (!mobileQuery.matches) {

        card.style.animation = "none";

        closeTimer = setTimeout(function() {
            card.style.animation = "";
            card.style.position = "";
            card.style.top = "";
            card.style.left = "";
            card.style.transform = "";
        }, 800);
    }
}

/* =========================
   DESKTOP CLICK
   ========================= */

cards.forEach(function(card) {

    card.addEventListener("click", function(event) {

        event.stopPropagation();

        // 手机端由 pointer 事件处理
        if (mobileQuery.matches) return;

        if (activeCard === card) {
            closeCard();
        } else {
            if (activeCard) closeCard();
            openCard(card);
        }
    });

});

/* 点击空白处关闭 */
document.addEventListener("click", function() {

    if (activeCard) {
        closeCard();
    }
});

/* =========================
   MOBILE CARD STACK
   ========================= */

let topCardIndex = cards.length - 1;

let startX = 0;
let startY = 0;

let isDragging = false;
let swipeLocked = false;

let currentPointerId = null;

/* 初始化叠放顺序 */
function updateStack() {

    cards.forEach(function(card, index) {
        card.style.zIndex = index + 1;
    });

}

updateStack();

/* =========================
   MOBILE POINTER EVENTS
   ========================= */

cards.forEach(function(card, index) {

    card.addEventListener("pointerdown", function(e) {

        if (!mobileQuery.matches) return;
        if (swipeLocked) return;
        if (index !== topCardIndex) return;
        
if (activeCard) {
    if (activeCard === card) {
        e.stopPropagation();
        closeCard();
    }
    return;
}


        startX = e.clientX;
        startY = e.clientY;

        isDragging = true;
        currentPointerId = e.pointerId;

        card.classList.add("swiping");

        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener("pointermove", function(e) {

        if (!mobileQuery.matches) return;
        if (!isDragging) return;
        if (e.pointerId !== currentPointerId) return;
        if (index !== topCardIndex) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        card.style.transform =
            `translate(
                calc(-50% + ${dx}px),
                calc(-50% + ${dy * 0.2}px)
            )
            rotate(${dx * 0.05}deg)`;
    });

    card.addEventListener("pointerup", function(e) {

        if (!mobileQuery.matches) return;
        if (!isDragging) return;
        if (e.pointerId !== currentPointerId) return;
        if (index !== topCardIndex) return;

        isDragging = false;
        currentPointerId = null;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        card.classList.remove("swiping");

        /* 左右滑动超过 80px */
        if (Math.abs(dx) > 80) {

            swipeLocked = true;

            const direction = dx > 0 ? 1 : -1;

            card.classList.add("swipe-away");

            card.style.transform =
                `translate(
                    calc(-50% + ${direction * 120}vw),
                    -50%
                )
                rotate(${direction * 25}deg)`;

            setTimeout(function() {

                card.style.display = "none";

                topCardIndex--;

                if (topCardIndex < 0) {
                    resetStack();
                }

                swipeLocked = false;

            }, 400);

        } else {

            /* 没有滑动：恢复原位 */
            card.style.transform = "";

            /* 轻点卡片：播放视频 */
          
if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    e.stopPropagation();
    openCard(card);
}

        }
    });

    card.addEventListener("pointercancel", function() {

        if (!mobileQuery.matches) return;

        isDragging = false;
        currentPointerId = null;

        card.classList.remove("swiping");
        card.style.transform = "";
    });

});




/* =========================
   RESET STACK
   ========================= */

function resetStack() {

    topCardIndex = cards.length - 1;

    cards.forEach(function(card) {

        card.style.display = "";
        card.style.transform = "";

        card.classList.remove(
            "swiping",
            "swipe-away",
            "expanded"
        );
    });

    updateStack();
}

/* =========================
   SCREEN RESIZE
   ========================= */

mobileQuery.addEventListener("change", function() {

    if (activeCard) {
        closeCard();
    }

    resetStack();

    cards.forEach(function(card) {
        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.animation = "";
        card.style.transform = "";
    });
});
