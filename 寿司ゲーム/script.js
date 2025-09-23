const sushiTypes = [
    { name: 'maguro', image: 'maguro.jpg' },
    { name: 'ebi', image: 'ebi.jpg' },
    { name: 'sake', image: 'sake.jpg' },
    { name: 'iwashi', image: 'iwashi.jpg' },
    { name: 'ikura', image: 'ikura.jpg' },
    { name: 'ika', image: 'ika.jpg' }, 
    { name: 'tekkamaki', image: 'tekkamaki.jpg' }, 
    { name: 'anago', image: 'anago.jpg' }, 
    { name: 'maguro3', image: 'maguro3.jpg' }, 
    { name: 'inari', image: 'inari.jpg' }, 
    { name: 'tamago', image: 'tamago.jpg' }, 
];

let gameActive = false;
let currentOrder = '';
let score = 0;
let mistakes = 0;
let timeLeft = 60;
let gameTimer;
let sushiGenerationTimer;
let sushiSpeed = 4;
let sushiList = [];
let preloadedImages = {};
let imagesLoaded = 0;
let totalImages = sushiTypes.length;
let allImagesLoaded = false;

// 画像をプリロードする関数（強化版）
function preloadImages() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        
        sushiTypes.forEach(sushi => {
            const img = new Image();
            
            img.onload = () => {
                preloadedImages[sushi.name] = img;
                loadedCount++;
                imagesLoaded = loadedCount;
                
                // 読み込み進捗を表示（オプション）
                console.log(`画像読み込み進捗: ${loadedCount}/${totalImages}`);
                
                if (loadedCount === totalImages) {
                    allImagesLoaded = true;
                    console.log('全ての画像の読み込みが完了しました');
                    resolve();
                }
            };
            
            img.onerror = () => {
                // エラーが発生した場合はフォールバック画像を作成
                const fallbackImg = createFallbackImage(sushi.name);
                preloadedImages[sushi.name] = fallbackImg;
                loadedCount++;
                imagesLoaded = loadedCount;
                
                console.warn(`画像読み込みエラー: ${sushi.image} - フォールバック画像を使用`);
                
                if (loadedCount === totalImages) {
                    allImagesLoaded = true;
                    console.log('全ての画像の読み込みが完了しました（一部フォールバック使用）');
                    resolve();
                }
            };
            
            img.src = sushi.image;
        });
        
        // タイムアウト処理（10秒経過したら強制的に完了）
        setTimeout(() => {
            if (!allImagesLoaded) {
                console.warn('画像読み込みタイムアウト - 部分的に読み込まれた画像でゲーム開始');
                allImagesLoaded = true;
                resolve();
            }
        }, 10000);
    });
}

// フォールバック画像を作成する関数
function createFallbackImage(sushiName) {
    const canvas = document.createElement('canvas');
    canvas.width = 65;
    canvas.height = 65;
    const ctx = canvas.getContext('2d');
    
    // 背景色
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 65, 65);
    
    // 枠線
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 63, 63);
    
    // 寿司名を描画
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sushiName, 32.5, 32.5);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
}

// 画像を安全に取得する関数
function getSafeImage(sushiName) {
    if (preloadedImages[sushiName]) {
        return preloadedImages[sushiName].cloneNode ? preloadedImages[sushiName].cloneNode() : preloadedImages[sushiName];
    }
    
    // フォールバック画像を作成
    return createFallbackImage(sushiName);
}

// ページ読み込み時に画像をプリロード
window.addEventListener('load', async () => {
    console.log('画像のプリロードを開始します...');
    await preloadImages();
    console.log('画像のプリロードが完了しました');
});

function getRandomSushi() {
    return sushiTypes[Math.floor(Math.random() * sushiTypes.length)];
}

function generateNewOrder() {
    const randomSushi = getRandomSushi();
    currentOrder = randomSushi.name;
    
    // 注文表示用の画像を作成
    const orderImg = document.createElement('img');
    const safeImg = getSafeImage(randomSushi.name);
    
    // プリロードされた画像のsrcを使用
    if (safeImg.src) {
        orderImg.src = safeImg.src;
    } else if (safeImg.toDataURL) {
        orderImg.src = safeImg.toDataURL();
    }
    
    orderImg.style.width = '100%';
    orderImg.style.height = 'auto';
    orderImg.style.maxHeight = '60px';
    orderImg.style.objectFit = 'contain';
    orderImg.alt = randomSushi.name;
    
    const orderDisplay = document.getElementById('currentOrder');
    orderDisplay.innerHTML = '';
    orderDisplay.appendChild(orderImg);
}

function createSushi() {
    if (!gameActive) return;
    
    const sushi = document.createElement('div');
    sushi.className = 'sushi';
    const sushiType = getRandomSushi();
    
    // 寿司画像を作成
    const sushiImg = document.createElement('img');
    const safeImg = getSafeImage(sushiType.name);
    
    // プリロードされた画像のsrcを使用
    if (safeImg.src) {
        sushiImg.src = safeImg.src;
    } else if (safeImg.toDataURL) {
        sushiImg.src = safeImg.toDataURL();
    }
    
    sushiImg.alt = sushiType.name;
    sushiImg.style.width = '65px';
    sushiImg.style.height = '65px';
    sushiImg.style.objectFit = 'contain';
    
    // 画像読み込み時の処理
    sushiImg.onload = function() {
        // 画像が正常に読み込まれた場合の処理
        this.style.opacity = '1';
    };
    
    sushiImg.onerror = function() {
        // 画像読み込みエラーの場合、フォールバック画像を再設定
        const fallbackImg = createFallbackImage(sushiType.name);
        this.src = fallbackImg.src;
    };
    
    sushi.appendChild(sushiImg);
    
    sushi.style.right = '-100px';
    sushi.style.width = '70px';
    sushi.style.height = '70px';
    sushi.dataset.type = sushiType.name;
    sushi.dataset.clicked = 'false';
    
    const conveyor = document.getElementById('conveyor');
    conveyor.appendChild(sushi);
    
    sushiList.push(sushi);
    
    // 寿司を移動
    moveSushi(sushi);
}

function moveSushi(sushi) {
    let position = -100;
    const moveInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(moveInterval);
            return;
        }
        
        position += sushiSpeed;
        sushi.style.right = position + 'px';
        
        if (position > window.innerWidth + 100) {
            clearInterval(moveInterval);
            if (sushi && sushi.parentNode) {
                sushi.parentNode.removeChild(sushi);
                const index = sushiList.indexOf(sushi);
                if (index > -1) {
                    sushiList.splice(index, 1);
                }
            }
        }
    }, 16);
}

function handleConveyorClick(e) {
    e.preventDefault();
    e.stopPropagation();
    findAndClickSushi(e.clientX, e.clientY);
}

function handleConveyorTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    findAndClickSushi(touch.clientX, touch.clientY);
}

function findAndClickSushi(x, y) {
    for (let sushi of sushiList) {
        if (!sushi || sushi.dataset.clicked === 'true') continue;
        
        const rect = sushi.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            handleSushiClick(sushi);
            break;
        }
    }
}

function handleSushiClick(sushi) {
    if (!sushi || sushi.dataset.clicked === 'true') return;
    
    const sushiType = sushi.dataset.type;
    
    if (sushiType === currentOrder) {
        // 正解
        sushi.dataset.clicked = 'true';
        sushi.classList.add('correct-flash');
        score++;
        document.getElementById('score').textContent = score;
        generateNewOrder();
        
        // 寿司を削除
        setTimeout(() => {
            if (sushi && sushi.parentNode) {
                sushi.parentNode.removeChild(sushi);
                const index = sushiList.indexOf(sushi);
                if (index > -1) {
                    sushiList.splice(index, 1);
                }
            }
        }, 300);
        
        // 難易度を上げる
        if (score % 5 === 0 && sushiSpeed < 8) {
            sushiSpeed += 0.5;
        }
    } else {
        // 間違い
        sushi.classList.add('wrong-flash');
        mistakes++;
        document.getElementById('mistakes').textContent = mistakes;
        
        setTimeout(() => {
            if (sushi) {
                sushi.classList.remove('wrong-flash');
            }
        }, 300);
        
        if (mistakes >= 3) {
            endGame();
        }
    }
}

function updateTimer() {
    document.getElementById('timer').textContent = timeLeft;
    timeLeft--;
    
    if (timeLeft < 0) {
        endGame();
    }
}

function getRank(score) {
    if (score >= 20) return { rank: '達人', color: '#FFD700' };
    if (score >= 15) return { rank: '達人手前', color: '#FF6347' };
    if (score >= 10) return { rank: '熟練者', color: '#32CD32' };
    if (score >= 5) return { rank: '修行者', color: '#87CEEB' };
    return { rank: '見習い', color: '#DDA0DD' };
}

function startGame() {
    // 画像がまだ読み込まれていない場合は少し待つ
    if (!allImagesLoaded) {
        console.log('画像読み込み中...少しお待ちください');
        setTimeout(startGame, 500);
        return;
    }
    
    document.getElementById('startScreen').style.display = 'none';
    
    // 前回のゲームのタイマーがあればクリア
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    if (sushiGenerationTimer) {
        clearInterval(sushiGenerationTimer);
    }
    
    gameActive = true;
    score = 0;
    mistakes = 0;
    timeLeft = 60;
    sushiSpeed = 4;
    sushiList = [];
    
    document.getElementById('score').textContent = score;
    document.getElementById('mistakes').textContent = mistakes;
    document.getElementById('timer').textContent = timeLeft;
    
    // 既存の寿司を削除
    const conveyor = document.getElementById('conveyor');
    conveyor.innerHTML = '';
    
    generateNewOrder();
    
    // コンベアレーン全体にタッチイベントを追加
    conveyor.addEventListener('click', handleConveyorClick);
    conveyor.addEventListener('touchstart', handleConveyorTouch, { passive: false });
    
    gameTimer = setInterval(updateTimer, 1000);
    
    // 寿司を定期的に生成
    sushiGenerationTimer = setInterval(() => {
        if (gameActive) createSushi();
    }, 250);
}

function endGame() {
    gameActive = false;
    
    // 全てのタイマーをクリア
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    if (sushiGenerationTimer) {
        clearInterval(sushiGenerationTimer);
    }
    
    // イベントリスナーを削除
    const conveyor = document.getElementById('conveyor');
    conveyor.removeEventListener('click', handleConveyorClick);
    conveyor.removeEventListener('touchstart', handleConveyorTouch);
    
    const rankInfo = getRank(score);
    document.getElementById('finalScore').textContent = score;
    const rankElement = document.getElementById('rank');
    rankElement.textContent = rankInfo.rank;
    rankElement.style.color = rankInfo.color;
    
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // 既存の寿司を削除
    const conveyor = document.getElementById('conveyor');
    conveyor.innerHTML = '';
    sushiList = [];
    
    startGame();
}
