
const cards = document.querySelectorAll(".card");
const gallery = document.querySelector(".gallery");

let activeCard = null;

cards.forEach(function(card) {
    const video = card.querySelector("video");

    video.addEventListener("loadedmetadata", function() {
        if (video.duration > 0.1) {
            video.currentTime = 0.1;
        }
    }, { once: true });

    card.addEventListener("click", function(event) {
        event.stopPropagation();

        if (activeCard === card) {
            closeCard();
            return;
        }

        if (activeCard) {
            closeCard();
        }

        openCard(card);
    });
});

function openCard(card) {
    const video = card.querySelector("video");

    // 记录卡片当前的位置
    const rect = card.getBoundingClientRect();

    // 暂停漂浮动画，固定当前位置
    card.style.animation = "none";
    card.style.position = "fixed";
    card.style.top = rect.top + "px";
    card.style.left = rect.left + "px";
    card.style.transform = "none";

    // 强制浏览器确认起始位置
    card.getBoundingClientRect();

    // 开始移动到中央
    card.classList.add("expanded");
    gallery.classList.add("has-active");

    // 清除临时定位，让 CSS 的居中样式生效
    card.style.top = "";
    card.style.left = "";
    card.style.transform = "";

    activeCard = card;

    video.currentTime = 0;
    video.play();
}


function closeCard() {
    if (!activeCard) return;

    const card = activeCard;
    const video = card.querySelector("video");

    video.pause();

    // 暂停漂浮动画
    card.style.animation = "none";

    // 移除放大状态
    card.classList.remove("expanded");
    gallery.classList.remove("has-active");

    // 等待卡片完成缩小和移动
    setTimeout(function() {

        // 恢复原来的漂浮动画
        card.style.animation = "";

        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.transform = "";

    }, 800);

    activeCard = null;
}

document.addEventListener("click", function() {
    if (activeCard) {
        closeCard();
    }
});
