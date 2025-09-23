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
        let sushiGenerationTimer; // 寿司生成用のタイマーを追加
        let sushiSpeed = 4;
        let sushiList = [];
        let preloadedImages = {}; // プリロード済み画像を保存
        let generationInterval = 250; // 初期生成間隔（ミリ秒）
        
        // シャッフルバッグ用の変数
        let sushiBag = [];
        let bagIndex = 0;
        let nextSushiBag = []; // 次のバッグを事前準備
        
        // 画像をプリロードする関数
        function preloadImages() {
            sushiTypes.forEach(sushi => {
                const img = new Image();
                img.src = sushi.image;
                preloadedImages[sushi.name] = img;
            });
        }
        
        // ページ読み込み時に画像をプリロード
        window.addEventListener('load', preloadImages);
        
        // 軽量なシャッフル関数（元配列を直接変更）
        function shuffleArrayInPlace(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        // 寿司バッグを初期化する関数（最適化版）
        function initializeSushiBag() {
            sushiBag = [...sushiTypes];
            shuffleArrayInPlace(sushiBag);
            bagIndex = 0;
            
            // 次のバッグも事前準備（非同期で）
            prepareNextBag();
        }
        
        // 次のバッグを非同期で事前準備
        function prepareNextBag() {
            setTimeout(() => {
                nextSushiBag = [...sushiTypes];
                shuffleArrayInPlace(nextSushiBag);
            }, 0);
        }
        
        // シャッフルバッグ方式で寿司を取得（最適化版）
        function getRandomSushi() {
            // バッグが空になったら事前準備済みのバッグを使用
            if (bagIndex >= sushiBag.length) {
                // 事前準備済みのバッグがあればそれを使用、なければ即座に作成
                if (nextSushiBag.length > 0) {
                    sushiBag = nextSushiBag;
                    nextSushiBag = [];
                } else {
                    sushiBag = [...sushiTypes];
                    shuffleArrayInPlace(sushiBag);
                }
                bagIndex = 0;
                
                // 次のバッグを非同期で準備
                prepareNextBag();
            }
            
            const sushi = sushiBag[bagIndex];
            bagIndex++;
            return sushi;
        }
        
        function generateNewOrder() {
            const randomSushi = getRandomSushi();
            currentOrder = randomSushi.name;
            // 注文表示用の画像を作成（プリロード済み画像を使用）
            const orderImg = document.createElement('img');
            if (preloadedImages[randomSushi.name]) {
                orderImg.src = preloadedImages[randomSushi.name].src;
            } else {
                orderImg.src = randomSushi.image;
            }
            orderImg.style.width = '100%';
            orderImg.style.height = 'auto';
            orderImg.style.maxHeight = '60px';
            orderImg.style.objectFit = 'contain';
            
            const orderDisplay = document.getElementById('currentOrder');
            orderDisplay.innerHTML = '';
            orderDisplay.appendChild(orderImg);
        }
        
        function createSushi() {
            if (!gameActive) return;
            
            // DOM要素が多すぎる場合は生成をスキップ
            if (sushiList.length > 8) {
                return;
            }
            
            const sushi = document.createElement('div');
            sushi.className = 'sushi';
            const sushiType = getRandomSushi();
            
            // 寿司画像を作成（プリロード済み画像を使用）
            const sushiImg = document.createElement('img');
            if (preloadedImages[sushiType.name]) {
                sushiImg.src = preloadedImages[sushiType.name].src;
            } else {
                sushiImg.src = sushiType.image;
            }
            sushiImg.alt = sushiType.name;
            // 寿司のサイズを1.3倍に設定
            sushiImg.style.width = '65px'; // 元の50pxの1.3倍
            sushiImg.style.height = '65px';
            sushiImg.style.objectFit = 'contain';
            sushi.appendChild(sushiImg);
            
            sushi.style.right = '-100px';
            // 寿司のコンテナサイズも大きくする
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
                    removeSushiFromList(sushi);
                }
            }, 16);
        }
        
        // 寿司をリストから削除する関数（最適化）
        function removeSushiFromList(sushi) {
            if (sushi && sushi.parentNode) {
                sushi.parentNode.removeChild(sushi);
                const index = sushiList.indexOf(sushi);
                if (index > -1) {
                    sushiList.splice(index, 1);
                }
            }
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
                    removeSushiFromList(sushi);
                }, 300);
                
                // 難易度を上げる（生成間隔も調整）
                if (score % 5 === 0 && sushiSpeed < 8) {
                    sushiSpeed += 0.5;
                    // 速度上昇時は生成間隔を少し延ばして負荷軽減
                    if (generationInterval > 300) {
                        generationInterval -= 20;
                        restartSushiGeneration();
                    }
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
        
        // 寿司生成タイマーを再開する関数
        function restartSushiGeneration() {
            if (sushiGenerationTimer) {
                clearInterval(sushiGenerationTimer);
            }
            sushiGenerationTimer = setInterval(() => {
                if (gameActive) createSushi();
            }, generationInterval);
        }
        
        function startGame() {
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
            generationInterval = 400; // 生成間隔をリセット
            
            // シャッフルバッグを初期化
            initializeSushiBag();
            
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
            
            // 寿司を定期的に生成（最適化された間隔で）
            restartSushiGeneration();
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
