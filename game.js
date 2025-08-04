class DinoGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // 게임 상태
        this.gameRunning = false;
        this.gameSpeed = 1.5; // 전체적으로 느리게 조정
        this.score = 0;
        this.gameSpeedIncrease = 0.005;
        
        // 스테이지 시스템
        this.currentStage = 1;
        this.maxStage = 3;
        this.lives = 3;
        
        // 스테이지별 캐릭터 정보
        this.stageInfo = {
            1: {
                // name: "Dodo",
                description: "The dodo was a flightless bird that lived on Mauritius Island. It became extinct in the late 1600s due to human hunting, habitat destruction, and the introduction of invasive animals such as rats and pigs. Human activities also caused environmental pollution, which damaged the dodo’s natural habitat. Because the dodo could not fly, it was easy for predators to catch it. The loss of the dodo shows how human actions, including pollution, can lead to the extinction of species.",
                image: "charactor/1.png"
            },
            2: {
                // name: "Golden Toad",
                description: "The Golden Toad was a small, brightly colored amphibian that lived in the cloud forests of Costa Rica. It became extinct in the late 1980s due to habitat loss, climate change, and fungal diseases. Environmental pollution also harmed its habitat, making survival difficult. The Golden Toad’s disappearance shows how climate change and pollution can threaten vulnerable species.",
                image: "charactor/3.png" // 스테이지 2 전용 캐릭터
            },
            3: {
                // name: "",
                description: "Humans have greatly impacted the Earth through pollution, climate change, and habitat destruction. If these problems continue unchecked, they could lead to severe environmental damage and resource shortages. This may cause the collapse of ecosystems that support human life. Some scientists warn that if global warming worsens and pollution increases, humans could face the risk of extinction in the distant future. This scenario reminds us of the importance of protecting the environment to ensure the survival of our species.",
                image: "charactor/5.png"
            }
        };
        
        this.player = {
            x: 100,
            y: 90,
            width: 100,
            height: 100,
            hitboxWidth: 80,
            hitboxHeight: 80,
            jumpPower: 0,
            grounded: true,
            ducking: false,
            velocityX: 0,
            speed: 4
        };
  
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnRate = 120;
        
        this.stackedObstacles = [];
        

        this.clouds = [];
        this.ground = [];
        
        this.gravity = 0.5;
        this.friction = 0.8;
        this.wallX = 0; 
        this.keys = {};
        
        this.characterPaths = {
            1: ['charactor/1.png', 'charactor/2.png'],
            2: ['charactor/3.png', 'charactor/4.png'],
            3: ['charactor/5.png', 'charactor/6.png']
        };
        
        this.playerImage1 = new Image();
        this.playerImage2 = new Image();
        this.loadStageCharacter();
        
        this.lifeOnImage = new Image();
        this.lifeOffImage = new Image();
        this.lifeOnImage.src = 'icon/life_on.png';
        this.lifeOffImage.src = 'icon/life_off.png';
        this.lifeImagesLoaded = 0;
        
        this.imagesLoaded = 0;
        
        this.animationFrame = 0;
        this.animationSpeed = 20;
        
        this.obstacleImages = {
            cactus: new Image(),
            bird: new Image()
        };
        this.obstacleImages.cactus.src = 'trash/pet.png';
        this.obstacleImages.bird.src = 'trash/plane.png';
        this.obstacleImagesLoaded = 0;
        
        this.init();
    }
    
    loadStageCharacter() {
        // 현재 스테이지의 캐릭터 이미지 로드
        const paths = this.characterPaths[this.currentStage];
        this.playerImage1.src = paths[0];
        this.playerImage2.src = paths[1];
        this.imagesLoaded = 0;
    }
    
    init() {
        this.setupEventListeners();
        this.setupGround();
        this.setupClouds();
        
        // 이미지가 모두 로드되면 게임 시작
        this.playerImage1.onload = () => {
            this.imagesLoaded++;
            if (this.imagesLoaded === 1) {
                // 첫 번째 이미지로 비율 조정
                const aspectRatio = this.playerImage1.width / this.playerImage1.height;
                if (aspectRatio > 1) {
                    this.player.width = 100;
                    this.player.height = 100 / aspectRatio;
                } else {
                    this.player.height = 100;
                    this.player.width = 100 * aspectRatio;
                }
            }
            if (this.imagesLoaded >= 2) {
                this.startGame();
            }
        };
        
        this.playerImage2.onload = () => {
            this.imagesLoaded++;
            if (this.imagesLoaded >= 2) {
                this.startGame();
            }
        };
        
        // 이미지 로드 실패 시 처리
        this.playerImage1.onerror = () => {
            console.warn('캐릭터 이미지 1 로드 실패');
            this.imagesLoaded++;
            this.checkStartGame();
        };
        
                 this.playerImage2.onerror = () => {
             console.warn('캐릭터 이미지 2 로드 실패');
             this.imagesLoaded++;
             this.checkStartGame();
         };
         
         // 장애물 이미지 로드 이벤트 (게임 시작과 독립적)
         this.obstacleImages.cactus.onload = () => {
             this.obstacleImagesLoaded++;
         };
         
         this.obstacleImages.bird.onload = () => {
             this.obstacleImagesLoaded++;
         };
         
         this.obstacleImages.cactus.onerror = () => {
             console.warn('선인장 이미지 로드 실패, 박스로 대체됩니다.');
             this.obstacleImagesLoaded++;
         };
         
         this.obstacleImages.bird.onerror = () => {
             console.warn('새 이미지 로드 실패, 박스로 대체됩니다.');
             this.obstacleImagesLoaded++;
         };
         
         // 목숨 아이콘 로드 이벤트
         this.lifeOnImage.onload = () => {
             this.lifeImagesLoaded++;
         };
         
         this.lifeOffImage.onload = () => {
             this.lifeImagesLoaded++;
         };
         
         this.lifeOnImage.onerror = () => {
             console.warn('생명 아이콘(on) 로드 실패');
             this.lifeImagesLoaded++;
         };
         
         this.lifeOffImage.onerror = () => {
             console.warn('생명 아이콘(off) 로드 실패');
             this.lifeImagesLoaded++;
         };
    }
    
    checkStartGame() {
        if (this.imagesLoaded >= 2) {
            // 기본 크기 유지
            this.player.width = 100;
            this.player.height = 100;
            this.startGame();
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
            
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.duck();
            }
            
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.moveLeft();
            }
            
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.moveRight();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (e.code === 'ArrowDown') {
                this.stopDuck();
            }
            
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                this.stopMove();
            }
        });
    }
    
    setupGround() {
        for (let i = 0; i < this.canvas.width + 50; i += 50) {
            this.ground.push({
                x: i,
                y: this.canvas.height - 10,
                width: 50,
                height: 10
            });
        }
    }
    
    setupClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 50 + 20,
                width: 30,
                height: 15
            });
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 점수 업데이트
        this.score += 0.5;
        this.scoreElement.textContent = Math.floor(this.score);
        
        // 게임 속도 증가
        this.gameSpeed += this.gameSpeedIncrease;
        
        // 플레이어 업데이트
        this.updatePlayer();
        
        // 애니메이션 업데이트
        this.updateAnimation();
        
        // 장애물 업데이트
        this.updateObstacles();
        
        // 배경 업데이트
        this.updateBackground();
        
        // 충돌 체크
        this.checkCollisions();
    }
    
    updatePlayer() {
        // 좌우 이동 처리
        this.player.x += this.player.velocityX;
        
        // 경계 처리 (화면 밖으로 나가지 않게)
        if (this.player.x < 0) {
            this.player.x = 0;
        }
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // 중력 적용
        if (!this.player.grounded) {
            this.player.jumpPower += 0.8; // 중력
            this.player.y += this.player.jumpPower;
        }
        
        // 땅에 착지
        if (this.player.y >= 100) {
            this.player.y = 100;
            this.player.grounded = true;
            this.player.jumpPower = 0;
        }
        
        // 웅크리기 상태에 따른 크기 조정
        if (this.player.ducking) {
            // 웅크리기 시 높이만 60%로 줄임 (너비는 그대로 유지)
            this.player.height = 60;
            this.player.hitboxHeight = 50; // 충돌박스도 줄임
            // 너비는 원래 크기 그대로 유지
            if (this.imagesLoaded >= 1) {
                const aspectRatio = this.playerImage1.width / this.playerImage1.height;
                if (aspectRatio > 1) {
                    this.player.width = 100;
                } else {
                    this.player.width = 100 * aspectRatio;
                }
            } else {
                this.player.width = 100;
            }
            this.player.y = 140;
        } else {
            // 기본 크기로 복원
            this.player.hitboxHeight = 80; // 충돌박스도 복원
            if (this.imagesLoaded >= 1) {
                const aspectRatio = this.playerImage1.width / this.playerImage1.height;
                if (aspectRatio > 1) {
                    this.player.width = 100;
                    this.player.height = 100 / aspectRatio;
                } else {
                    this.player.height = 100;
                    this.player.width = 100 * aspectRatio;
                }
            } else {
                this.player.height = 100;
                this.player.width = 100;
            }
            if (this.player.grounded) {
                this.player.y = 100;
            }
        }
    }
    
    updateAnimation() {
        // 애니메이션 프레임 업데이트
        this.animationFrame++;
    }
    
    updateObstacles() {
        // 새로운 장애물 생성
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnRate) {
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
            this.obstacleSpawnRate = Math.max(60, this.obstacleSpawnRate - 1);
        }
        
        // 장애물 이동 및 벽에 부딪히면 쌓이도록 처리
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            
            // 왼쪽 벽에 부딪히면 쌓인 장애물로 변환
            if (obstacle.x <= this.wallX) {
                obstacle.x = this.wallX + Math.random() * 20; // 벽에서 약간 떨어진 랜덤 위치
                obstacle.velocityX = Math.random() * 2 - 1; // 랜덤한 옆 방향 속도
                obstacle.velocityY = Math.random() * 3 + 1; // 랜덤한 떨어지는 속도
                obstacle.rotation = (Math.random() - 0.5) * 0.3; // 랜덤한 회전각
                obstacle.rotationSpeed = (Math.random() - 0.5) * 0.1; // 회전 속도
                obstacle.grounded = false;
                obstacle.bounceCount = 0; // 바운스 횟수
                
                // 쌓인 장애물에도 display 크기가 없으면 추가
                if (!obstacle.displayWidth) {
                    if (obstacle.type === 'cactus') {
                        obstacle.displayWidth = 60;
                        obstacle.displayHeight = 60;
                    } else {
                        obstacle.displayWidth = 75;
                        obstacle.displayHeight = 45;
                    }
                }
                
                this.stackedObstacles.push(obstacle);
                return false; // 이동 중인 장애물에서 제거
            }
            
            return obstacle.x + obstacle.width > 0;
        });
        
        // 쌓인 장애물들 물리 엔진 적용
        this.updateStackedObstacles();
    }
    
    updateBackground() {
        // 땅 이동
        this.ground.forEach(ground => {
            ground.x -= this.gameSpeed;
            if (ground.x + ground.width < 0) {
                ground.x = this.canvas.width;
            }
        });
        
        // 구름 이동
        this.clouds.forEach(cloud => {
            cloud.x -= this.gameSpeed * 0.3;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
            }
        });
    }
    
    updateStackedObstacles() {
        this.stackedObstacles.forEach(obstacle => {
            if (!obstacle.grounded) {
                // 중력 적용
                obstacle.velocityY += this.gravity;
                obstacle.y += obstacle.velocityY;
                obstacle.x += obstacle.velocityX;
                
                // 회전 적용
                obstacle.rotation += obstacle.rotationSpeed;
                
                // 마찰력 적용
                obstacle.velocityX *= 0.98;
                
                // 벽 경계 체크
                if (obstacle.x < this.wallX) {
                    obstacle.x = this.wallX;
                    obstacle.velocityX = Math.abs(obstacle.velocityX) * 0.3; // 벽에서 약간 튕김
                }
                
                // 땅에 닿으면 바운스 또는 정지
                if (obstacle.y + obstacle.height >= this.canvas.height - 10) {
                    obstacle.y = this.canvas.height - 10 - obstacle.height;
                    
                    if (obstacle.bounceCount < 2 && Math.abs(obstacle.velocityY) > 1) {
                        obstacle.velocityY = -obstacle.velocityY * (0.3 + Math.random() * 0.2); // 바운스
                        obstacle.velocityX += (Math.random() - 0.5) * 1; // 바운스 시 랜덤 방향
                        obstacle.bounceCount++;
                    } else {
                        obstacle.velocityY = 0;
                        obstacle.grounded = true;
                        obstacle.rotationSpeed *= 0.8; // 회전 점차 멈춤
                    }
                }
                
                // 다른 쌓인 장애물들과의 정확한 충돌 검사
                this.stackedObstacles.forEach(other => {
                    if (obstacle !== other) {
                        if (this.isColliding(obstacle, other)) {
                            // 정확한 충돌 처리 - 겹치지 않게 조정
                            if (obstacle.y + obstacle.height > other.y && obstacle.velocityY > 0) {
                                // 위쪽으로 정확히 위치 조정
                                obstacle.y = other.y - obstacle.height;
                                obstacle.velocityY = -obstacle.velocityY * 0.3; // 약간 바운스
                                obstacle.velocityX += (Math.random() - 0.5) * 0.5; // 옆으로 미끄러짐
                                obstacle.bounceCount++;
                                
                                if (obstacle.bounceCount >= 3) {
                                    obstacle.grounded = true;
                                    obstacle.velocityY = 0;
                                }
                            }
                            
                            // 옆으로 밀려나는 처리
                            if (Math.abs(obstacle.x - other.x) < Math.abs(obstacle.y - other.y)) {
                                if (obstacle.x < other.x) {
                                    obstacle.x = other.x - obstacle.width;
                                } else {
                                    obstacle.x = other.x + other.width;
                                }
                                obstacle.velocityX *= 0.5;
                            }
                        }
                    }
                });
                
                // 최종 위치 조정 - 겹침 방지
                this.resolveOverlaps(obstacle);
                
            } else {
                // 땅에 있어도 약간씩 미끄러질 수 있음
                if (Math.abs(obstacle.velocityX) > 0.1) {
                    const oldX = obstacle.x;
                    obstacle.x += obstacle.velocityX;
                    
                    // 이동 시 충돌 체크
                    let hasCollision = false;
                    this.stackedObstacles.forEach(other => {
                        if (obstacle !== other && this.isColliding(obstacle, other)) {
                            hasCollision = true;
                        }
                    });
                    
                    if (hasCollision) {
                        obstacle.x = oldX; // 원래 위치로 복원
                        obstacle.velocityX = 0;
                    } else {
                        obstacle.velocityX *= 0.95;
                    }
                }
                
                // 회전도 점차 멈춤
                if (Math.abs(obstacle.rotationSpeed) > 0.01) {
                    obstacle.rotation += obstacle.rotationSpeed;
                    obstacle.rotationSpeed *= 0.9;
                }
            }
        });
    }
    
    resolveOverlaps(obstacle) {
        // 겹침 해결을 위한 반복 처리
        let maxIterations = 10;
        let iterations = 0;
        
        while (iterations < maxIterations) {
            let hasOverlap = false;
            
            this.stackedObstacles.forEach(other => {
                if (obstacle !== other && this.isColliding(obstacle, other)) {
                    hasOverlap = true;
                    
                    // 겹침 해결 - 가장 가까운 방향으로 밀어내기
                    const overlapX = Math.min(obstacle.x + obstacle.width - other.x, other.x + other.width - obstacle.x);
                    const overlapY = Math.min(obstacle.y + obstacle.height - other.y, other.y + other.height - obstacle.y);
                    
                    if (overlapX < overlapY) {
                        // 좌우로 밀어내기
                        if (obstacle.x < other.x) {
                            obstacle.x = other.x - obstacle.width;
                        } else {
                            obstacle.x = other.x + other.width;
                        }
                    } else {
                        // 상하로 밀어내기
                        if (obstacle.y < other.y) {
                            obstacle.y = other.y - obstacle.height;
                        } else {
                            obstacle.y = other.y + other.height;
                        }
                    }
                    
                    // 경계 체크
                    if (obstacle.x < this.wallX) {
                        obstacle.x = this.wallX;
                    }
                    if (obstacle.y + obstacle.height > this.canvas.height - 10) {
                        obstacle.y = this.canvas.height - 10 - obstacle.height;
                    }
                }
            });
            
            if (!hasOverlap) {
                break;
            }
            
            iterations++;
        }
    }
    
    spawnObstacle() {
        const obstacleType = Math.random();
        
        if (obstacleType < 0.7) {
            // 선인장 (낮은 장애물)
            this.obstacles.push({
                x: this.canvas.width,
                y: 160,
                width: 20,  // 충돌 박스 크기
                height: 20,
                displayWidth: 60,   // 실제 표시될 크기 (3배)
                displayHeight: 60,
                type: 'cactus'
            });
        } else {
            // 새 (높은 장애물)
            this.obstacles.push({
                x: this.canvas.width,
                y: 120,
                width: 25,  // 충돌 박스 크기
                height: 15,
                displayWidth: 75,   // 실제 표시될 크기 (3배)
                displayHeight: 45,
                type: 'bird'
            });
        }
    }
    
    jump() {
        if (this.player.grounded) {
            this.player.jumpPower = -15;
            this.player.grounded = false;
        }
    }
    
    duck() {
        if (this.player.grounded) {
            this.player.ducking = true;
        }
    }
    
    stopDuck() {
        this.player.ducking = false;
    }
    
    moveLeft() {
        this.player.velocityX = -this.player.speed;
    }
    
    moveRight() {
        this.player.velocityX = this.player.speed;
    }
    
    stopMove() {
        this.player.velocityX = 0;
    }
    
    checkCollisions() {
        // 이동 중인 장애물과 충돌 체크
        this.obstacles.forEach(obstacle => {
            if (this.isPlayerColliding(this.player, obstacle)) {
                this.gameOver();
            }
        });
        
        // 쌓인 장애물과 충돌 체크
        this.stackedObstacles.forEach(obstacle => {
            if (this.isPlayerColliding(this.player, obstacle)) {
                this.gameOver();
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    isLooseColliding(rect1, rect2) {
        // 더 느슨한 충돌 검사 - 약간의 여유 공간을 둠
        const margin = 3;
        return rect1.x < rect2.x + rect2.width + margin &&
               rect1.x + rect1.width > rect2.x - margin &&
               rect1.y < rect2.y + rect2.height + margin &&
               rect1.y + rect1.height > rect2.y - margin;
    }
    
    isPlayerColliding(player, obstacle) {
        // 플레이어의 히트박스를 중앙에 맞추기 위한 오프셋 계산
        const offsetX = (player.width - player.hitboxWidth) / 2;
        const offsetY = (player.height - player.hitboxHeight) / 2;
        
        // 플레이어의 실제 히트박스 위치
        const playerHitboxX = player.x + offsetX;
        const playerHitboxY = player.y + offsetY;
        
        // 히트박스로 충돌 검사
        return playerHitboxX < obstacle.x + obstacle.width &&
               playerHitboxX + player.hitboxWidth > obstacle.x &&
               playerHitboxY < obstacle.y + obstacle.height &&
               playerHitboxY + player.hitboxHeight > obstacle.y;
    }
    
    gameOver() {
        this.lives--;
        
        // 항상 팝업을 먼저 표시 (스테이지 완료 보고서)
        this.nextStage();
    }
    
    nextStage() {
        // 게임 먼저 정지
        this.gameRunning = false;
        
        // 모든 스테이지에서 동일한 팝업 표시
        this.showStageInfo();
    }
    

    
    finishGame() {
        document.getElementById('stagePopup').style.display = 'none';
        
        this.gameRunning = false;
        
        // 검정색 오버레이 서서히 나타나게 하기
        const overlay = document.getElementById('gameOverlay');
        overlay.style.opacity = '1';
        
        // 3초 후 게임 오버 화면 표시
        setTimeout(() => {
            // this.finalScoreElement.textContent = Math.floor(this.score) + ' (ALL CLEAR!)';
            this.gameOverElement.style.display = 'block';
        }, 3000);
    }
    
    resetStage() {
        this.obstacles = [];
        this.stackedObstacles = [];
        this.gameSpeed = 1.5; 
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnRate = 120;
        
        // 플레이어 위치 초기화
        this.player.x = 100;
        this.player.y = 100;
        this.player.velocityX = 0;
        this.player.jumpPower = 0;
        this.player.grounded = true;
        this.player.ducking = false;
    }
    
    resetStageWithoutStart() {
        // 게임 상태만 초기화하고 시작하지 않음
        this.obstacles = [];
        this.stackedObstacles = [];
        this.gameSpeed = 1.5; // 느린 속도로 고정 유지
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnRate = 120;
        
        // 플레이어 위치 초기화
        this.player.x = 100;
        this.player.y = 100;
        this.player.velocityX = 0;
        this.player.jumpPower = 0;
        this.player.grounded = true;
        this.player.ducking = false;
    }
    
    startNewStage() {
        // 완전 초기화
        this.obstacles = [];
        this.stackedObstacles = [];
        this.gameSpeed = 1.5; // 느린 속도로 고정 유지
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnRate = 120;
        this.animationFrame = 0; // 애니메이션도 초기화
        
        // 플레이어 완전 초기화
        this.player.x = 100;
        this.player.y = 100;
        this.player.velocityX = 0;
        this.player.jumpPower = 0;
        this.player.grounded = true;
        this.player.ducking = false;
        
        // 새 스테이지 캐릭터 로드
        this.loadStageCharacter();
        
        // 게임 시작
        this.gameRunning = true;
        this.gameLoop();
    }
    
    showStageInfo() {
        const completedStage = this.currentStage;  // 현재 완료한 스테이지
        if (completedStage < 1) return;
        
        const stageData = this.stageInfo[completedStage];
        if (!stageData) return;
        
        // 스테이지별 멸종 동물 이름 매핑
        const extinctionNames = {
            1: "Dodo",
            2: "Golden Toad", 
            3: "Human"
        };
        
        // 팝업 요소들 가져오기
        const popup = document.getElementById('stagePopup');
        const title = document.getElementById('stageTitle');
        const characterImg = document.getElementById('stageCharacterImg');
        const characterName = document.getElementById('characterName');
        const characterDesc = document.getElementById('characterDescription');
        const button = popup.querySelector('button');
        
        // 팝업 내용 설정
        const extinctionName = extinctionNames[completedStage] || completedStage;
        title.textContent = `Report on the Extinction of the ${extinctionName}`;
        characterImg.src = stageData.image;
        characterName.textContent = stageData.name;
        characterDesc.textContent = stageData.description;
        
        // 버튼 설정 (다음 스테이지가 있는지 확인)
        if (completedStage < this.maxStage) {
            button.textContent = 'Next';
            button.onclick = continueToNextStage;
        } else {
            // 마지막 스테이지 완료
            button.textContent = 'End of the Earth';
            button.onclick = () => this.finishGame();
        }
        
        // 팝업 표시
        popup.style.display = 'block';
    }
    
    draw() {
        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 배경 그리기
        this.drawBackground();
        
        // 쌓인 장애물들 그리기
        this.drawStackedObstacles();
        
        // 플레이어 그리기
        this.drawPlayer();
        
        // 장애물 그리기
        this.drawObstacles();
        
        // 목숨 표시
        this.drawLives();
    }
    
    drawBackground() {
        // 스테이지별 배경색 설정
        let backgroundColor, cloudColor, groundColor;
        switch(this.currentStage) {
            case 1:
                backgroundColor = '#f0f0f0';
                cloudColor = '#ddd';
                groundColor = '#333';
                break;
            case 2:
                backgroundColor = '#ffe4e1';
                cloudColor = '#ffc0cb';
                groundColor = '#8b4513';
                break;
            case 3:
                backgroundColor = '#e0e6ff';
                cloudColor = '#b19cd9';
                groundColor = '#2f4f4f';
                break;
            default:
                backgroundColor = '#f0f0f0';
                cloudColor = '#ddd';
                groundColor = '#333';
        }
        
        // 배경색 채우기
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 구름 그리기
        this.ctx.fillStyle = cloudColor;
        this.clouds.forEach(cloud => {
            this.ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        });
        
        // 땅 그리기
        this.ctx.fillStyle = groundColor;
        this.ground.forEach(ground => {
            this.ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
        });
    }
    
        drawPlayer() {
        if (this.imagesLoaded >= 2) {
            // 애니메이션 프레임에 따라 이미지 선택
            const frameIndex = Math.floor(this.animationFrame / this.animationSpeed) % 2;
            const currentImage = frameIndex === 0 ? this.playerImage1 : this.playerImage2;
            
            // 이미지 그리기
            const imageWidth = this.player.width;
            const imageHeight = this.player.height;
            
            this.ctx.drawImage(
                currentImage, 
                this.player.x, 
                this.player.y, 
                imageWidth, 
                imageHeight
            );
        } else if (this.imagesLoaded >= 1) {
            // 하나의 이미지만 로드된 경우
            this.ctx.drawImage(
                this.playerImage1, 
                this.player.x, 
                this.player.y, 
                this.player.width, 
                this.player.height
            );
        } else {
            // 이미지가 로드되지 않았으면 기존 박스를 그림
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // 웅크리기 상태 표시
            if (this.player.ducking) {
                this.ctx.fillStyle = '#c0392b';
                this.ctx.fillRect(this.player.x, this.player.y - 5, this.player.width, 5);
            }
        }
    }
    

    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });
    }
    
    drawLives() {
        // 오른쪽 상단에 목숨 표시
        const iconSize = 30;
        const margin = 10;
        const startX = this.canvas.width - (iconSize + margin) * 3 - margin;
        const startY = margin;
        
        if (this.lifeImagesLoaded >= 2) {
            // 이미지로 목숨 표시
            for (let i = 0; i < 3; i++) {
                const x = startX + i * (iconSize + margin);
                const y = startY;
                
                if (i < this.lives) {
                    // 남은 목숨은 life_on.png
                    this.ctx.drawImage(this.lifeOnImage, x, y, iconSize, iconSize);
                } else {
                    // 잃은 목숨은 life_off.png
                    this.ctx.drawImage(this.lifeOffImage, x, y, iconSize, iconSize);
                }
            }
        } else {
            // 이미지가 로드되지 않았으면 텍스트로 표시
            this.ctx.fillStyle = '#333';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Lives: ${this.lives}`, startX, startY + 20);
        }
        

    }
    
    drawObstacle(obstacle) {
        // 해당 타입의 이미지가 로드되었는지 확인
        const image = this.obstacleImages[obstacle.type];
        const imageLoaded = (obstacle.type === 'cactus' && this.obstacleImages.cactus.complete && this.obstacleImages.cactus.naturalWidth > 0) ||
                           (obstacle.type === 'bird' && this.obstacleImages.bird.complete && this.obstacleImages.bird.naturalWidth > 0);
        
        if (imageLoaded) {
            // 이미지가 로드되었으면 큰 크기로 그림 (중앙 정렬)
            const offsetX = (obstacle.displayWidth - obstacle.width) / 2;
            const offsetY = (obstacle.displayHeight - obstacle.height) / 2;
            
            this.ctx.drawImage(
                image,
                obstacle.x - offsetX,
                obstacle.y - offsetY,
                obstacle.displayWidth,
                obstacle.displayHeight
            );
        } else {
            // 이미지가 로드되지 않았으면 기존 박스를 그림 (충돌박스 크기)
            if (obstacle.type === 'cactus') {
                this.ctx.fillStyle = '#27ae60';
            } else {
                this.ctx.fillStyle = '#34495e';
            }
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    

    
    drawStackedObstacles() {
        this.stackedObstacles.forEach(obstacle => {
            this.ctx.save();
            
            // 회전 중심점을 장애물 중앙으로 이동
            const centerX = obstacle.x + obstacle.width / 2;
            const centerY = obstacle.y + obstacle.height / 2;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(obstacle.rotation || 0);
            
            // 해당 타입의 이미지가 로드되었는지 확인
            const image = this.obstacleImages[obstacle.type];
            const imageLoaded = (obstacle.type === 'cactus' && this.obstacleImages.cactus.complete && this.obstacleImages.cactus.naturalWidth > 0) ||
                               (obstacle.type === 'bird' && this.obstacleImages.bird.complete && this.obstacleImages.bird.naturalWidth > 0);
            
            if (imageLoaded) {
                // 이미지가 로드되었으면 큰 크기로 그림 (중심점 기준)
                this.ctx.drawImage(
                    image,
                    -obstacle.displayWidth / 2,
                    -obstacle.displayHeight / 2,
                    obstacle.displayWidth,
                    obstacle.displayHeight
                );
            } else {
                // 이미지가 로드되지 않았으면 기존 박스를 그림 (충돌박스 크기)
                if (obstacle.type === 'cactus') {
                    this.ctx.fillStyle = '#27ae60';
                } else {
                    this.ctx.fillStyle = '#34495e';
                }
                
                // 중심점을 기준으로 그리기
                this.ctx.fillRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
                
                // 쌓인 장애물 테두리 표시
                this.ctx.strokeStyle = '#1a252f';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(-obstacle.width / 2, -obstacle.height / 2, obstacle.width, obstacle.height);
            }
            
            this.ctx.restore();
        });
    }
}

// 게임 시작
let game;

function startGame() {
    game = new DinoGame();
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('stagePopup').style.display = 'none';
    
    // 검정색 오버레이 초기화
    const overlay = document.getElementById('gameOverlay');
    overlay.style.opacity = '0';
    
    // 오프닝 화면 요소들 초기화
    document.getElementById('playButtonContainer').style.display = 'flex';
    document.getElementById('startButtonContainer').style.opacity = '0';
    document.getElementById('openingScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // 새 게임 시작
    startGame();
}

// 페이지 로드 시 오프닝 화면 표시
window.addEventListener('load', () => {
    const video = document.getElementById('openingVideo');
    const playButton = document.getElementById('playButton');
    const startButton = document.getElementById('startButton');
    const playButtonContainer = document.getElementById('playButtonContainer');
    const startButtonContainer = document.getElementById('startButtonContainer');
    const openingScreen = document.getElementById('openingScreen');
    
    // 히든 개발자 모드 - 10번 클릭하면 바로 게임 시작
    let clickCount = 0;
    openingScreen.addEventListener('click', (e) => {
        // 버튼을 클릭한 것이 아닐 때만 카운트
        if (!e.target.closest('button')) {
            clickCount++;
            if (clickCount >= 10) {
                // 오프닝 화면 즉시 숨기기
                openingScreen.style.display = 'none';
                // 게임 컨테이너 표시
                document.getElementById('gameContainer').style.display = 'block';
                // 비디오 일시정지
                video.pause();
                // 게임 바로 시작
                startGame();
            }
        }
    });
    
    // 비디오 볼륨 최대로 설정
    video.volume = 1.0;
    
    // Play 버튼 클릭 시 비디오 재생
    playButton.addEventListener('click', () => {
        // Play 버튼 숨기기
        playButtonContainer.style.display = 'none';
        
        // 비디오 재생 (사운드 포함)
        video.play().then(() => {
            console.log('비디오 재생 시작');
            
            // 25초 후 Start 버튼 서서히 나타나기
            setTimeout(() => {
                startButtonContainer.style.opacity = '1';
            }, 25000); // 25초 딜레이
            
        }).catch(error => {
            console.log('비디오 재생 실패:', error);
            // 재생 실패해도 25초 후 Start 버튼은 보여주기
            setTimeout(() => {
                startButtonContainer.style.opacity = '1';
            }, 25000);
        });
    });
    
    // Start 버튼 클릭 시 게임 시작
    startButton.addEventListener('click', () => {
        // 오프닝 화면 숨기기
        document.getElementById('openingScreen').style.display = 'none';
        
        // 게임 컨테이너 보이기
        document.getElementById('gameContainer').style.display = 'block';
        
        // 비디오 정지
        video.pause();
        
        // 게임 시작
        startGame();
    });
});

// 다음 스테이지로 계속하기
function continueToNextStage() {
    // 팝업 숨기기
    document.getElementById('stagePopup').style.display = 'none';
    
    if (game) {
        // 마지막 스테이지가 아닐 때만 다음 스테이지로 진행
        if (game.currentStage < game.maxStage) {
            // 다음 스테이지로 진행
            game.currentStage++;
            
            // 완전 초기화하고 새 스테이지 시작
            game.startNewStage();
        }
        // 마지막 스테이지는 showStageInfo()에서 버튼이 "게임 종료"로 설정되어 finishGame() 호출됨
    }
} 