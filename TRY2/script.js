// ------------------- 取得 DOM 元素 -------------------
const cards = document.querySelectorAll('.card');
const startButton = document.getElementById('startButton');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const drawnCardContainer = document.getElementById('drawnCard');
const cardArea = document.getElementById('card-area');

// 剩餘卡牌 ID
let remainingCards = ['card1', 'card2', 'card3'];

// 用來儲存卡牌的動態屬性 (位置, 速度)
let cardStates = {}; // 例如: { card1: {x:0, y:0, vx:5, vy:3}, ... }

// 控制 requestAnimationFrame
let animationId = null;

// ------------------- 綁定事件 -------------------
startButton.addEventListener('click', startDrawing);
closeBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
});

// ------------------- 主流程：開始抽卡 -------------------
function startDrawing() {
  if (remainingCards.length === 0) {
    alert("所有卡片都已抽完！");
    return;
  }

  // 1) 初始化「快速飛舞」狀態
  initCardStates();
  cancelAnimationFrame(animationId); // 若先前有動畫，先停掉

  // 2) 卡片開始亂飛
  animateCards();

  // 3) 設定飛舞一段時間後抽卡 (例如 2 秒)，您可自行調整
  let flyDuration = 2000; // 2秒
  setTimeout(() => {
    // 停止飛舞
    cancelAnimationFrame(animationId);

    // 抽出一張卡
    const drawnId = drawOneCard();

    // 顯示抽到的卡牌（在彈窗中放大顯示）
    showDrawnCard(drawnId);

  }, flyDuration);
}

// ------------------- 初始化卡片的 (x, y, vx, vy) -------------------
function initCardStates() {
  // 取得 card-area 的邊界
  const rect = cardArea.getBoundingClientRect();
  const areaWidth = rect.width;
  const areaHeight = rect.height;

  cards.forEach(card => {
    const id = card.dataset.id;

    // 已被抽走的卡，不再設定動態
    if (!remainingCards.includes(id)) {
      card.style.display = 'none';
      return;
    }

    // 讓卡片顯示 (避免先前被抽走隱藏)
    card.style.display = 'block';

    // 隨機放在容器左上 100px ~ 500px 區間 (或可全部放中間)
    // 但要留意卡片本身寬高 (80x120)，避免直接出界
    const startX = Math.random() * (areaWidth - 80);
    const startY = Math.random() * (areaHeight - 120);

    // 隨機水平、垂直速度 (越大越快)
    // 正負值會決定初始方向
    const vx = (Math.random() * 10 - 5); // -5 ~ +5
    const vy = (Math.random() * 10 - 5); // -5 ~ +5

    // 記錄到 cardStates
    cardStates[id] = { x: startX, y: startY, vx, vy };

    // 立即把卡片位置移動到起始點
    card.style.left = startX + 'px';
    card.style.top = startY + 'px';
  });
}

// ------------------- 持續更新卡片位置的動畫 -------------------
function animateCards() {
  // 取得 card-area 的邊界
  const rect = cardArea.getBoundingClientRect();
  const areaWidth = rect.width;
  const areaHeight = rect.height;

  cards.forEach(card => {
    const id = card.dataset.id;
    if (!remainingCards.includes(id)) return;

    let state = cardStates[id];
    if (!state) return;

    // 更新位置
    state.x += state.vx;
    state.y += state.vy;

    // 碰撞容器邊界後反彈 (簡單的左右、上下反轉)
    // 注意：卡片寬80px、高120px
    if (state.x < 0) {
      state.x = 0;
      state.vx = -state.vx;
    } else if (state.x > areaWidth - 80) {
      state.x = areaWidth - 80;
      state.vx = -state.vx;
    }
    if (state.y < 0) {
      state.y = 0;
      state.vy = -state.vy;
    } else if (state.y > areaHeight - 120) {
      state.y = areaHeight - 120;
      state.vy = -state.vy;
    }

    // 將卡片的 CSS 位置更新
    card.style.left = state.x + 'px';
    card.style.top = state.y + 'px';
  });

  // 持續請求下一幀
  animationId = requestAnimationFrame(animateCards);
}

// ------------------- 隨機抽出一張卡 -------------------
function drawOneCard() {
  const randomIndex = Math.floor(Math.random() * remainingCards.length);
  const drawnId = remainingCards[randomIndex];
  // 從剩餘清單移除
  remainingCards.splice(randomIndex, 1);
  return drawnId;
}

// ------------------- 顯示被抽到的卡在 Modal -------------------
function showDrawnCard(drawnId) {
  // 找到對應卡片元素
  const drawnCardEl = document.querySelector(`.card[data-id="${drawnId}"]`);
  if (drawnCardEl) {
    // 螢幕上先隱藏，防止與其他卡重疊
    drawnCardEl.style.display = 'none';
  }

  // 在彈窗中插入其圖片 (若有 img)
  const cardImg = drawnCardEl.querySelector('img');
  if (cardImg) {
    drawnCardContainer.innerHTML = `
      <img src="${cardImg.src}" alt="${cardImg.alt}" />
    `;
  } else {
    // 如果沒有圖片，顯示文字
    drawnCardContainer.textContent = drawnId;
  }

  // 顯示 Modal
  overlay.classList.remove('hidden');
}
