    <script>
        const sushiTypes = [
            { name: 'maguro', image: 'maguro.jpg' },
            { name: 'ebi', image: 'ebi.jpg' },
            { name: 'sake', image: 'sake.jpg' },
            { name: 'iwashi', image: 'iwashi.jpg' },
            { name: 'ikura', image: 'ikura.jpg' }
        ];
        let gameActive = false;
        let currentOrder = '';
        let score = 0;
        let mistakes = 0;
        let timeLeft = 60;
        let gameTimer;
        let sushiGenerationTimer; // 寿司生成用のタイマーを追加
        let sushiSpeed = 2;
        let sushiList = [];
        
        function getRandomSushi() {
            return sushiTypes[Math.floor(Math.random() * sushiTypes.length)];
        }
        
        function generateNewOrder() {
            const randomSushi = getRandomSushi();
            currentOrder = randomSushi.name;
            // 注文表示用の画像を作成
            const orderImg = document.createElement('img');
            orderImg.src = randomSushi.image;
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
            
            const sushi = document.createElement('div');
            sushi.className = 'sushi';
            const sushiType = getRandomSushi();
            
            // 寿司画像を作成
            const sushiImg = document.createElement('img');
            sushiImg.src = sushiType.image;
            sushiImg.alt = sushiType.name;
            sushi.appendChild(sushiImg);
            
            sushi.style.right = '-80px';
            sushi.dataset.type = sushiType.name;
            sushi.dataset.clicked = 'false';
            
            const conveyor = document.getElementById('conveyor');
            conveyor.appendChild(sushi);
            
            sushiList.push(sushi);
            
            // 寿司を移動
            moveSushi(sushi);
        }
        
        function moveSushi(sushi) {
            let position = -80;
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
                if (score % 5 === 0 && sushiSpeed < 4) {
                    sushiSpeed += 0.3;
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
            if (score >= 40) return { rank: '達人', color: '#FFD700' };
            if (score >= 30) return { rank: '達人手前', color: '#FF6347' };
            if (score >= 15) return { rank: '熟練者', color: '#32CD32' };
            if (score >= 10) return { rank: '修行者', color: '#87CEEB' };
            return { rank: '見習い', color: '#DDA0DD' };
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
            sushiSpeed = 2;
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
            
            // 寿司を定期的に生成（間隔を短くして密に）
            sushiGenerationTimer = setInterval(() => {
                if (gameActive) createSushi();
            }, 300);
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
    </script>