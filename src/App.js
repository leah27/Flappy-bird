import './App.css';
import styled, {keyframes} from 'styled-components'
import {useState, useEffect} from 'react'

const BIRD_WIDTH = 70;
const BIRD_HEIGHT = 70;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 200;
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const GRAVITY = 6;
const JUMP_HEIGHT = 100;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_GAP = 200;

function App() {
  const [birdPosition, setBirdPosition] = useState(CANVAS_HEIGHT / 2 - BIRD_HEIGHT)
  const [gameHasStarted, setGameHasStarted] = useState(false)
  const [obstacleHeight, setObstacleHeight] = useState(100)
  const [obstacleLeft, setObstacleLeft] = useState(CANVAS_WIDTH - OBSTACLE_WIDTH)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const bottomObstacleHeight = CANVAS_HEIGHT - OBSTACLE_GAP - obstacleHeight
  const [defaultSound] = useState(new Audio('sounds/default.mp3'))
  const [hitSound] = useState(new Audio('sounds/hit.mp3'))

  useEffect(() => {
    let timeId;
    if(gameHasStarted && birdPosition < CANVAS_HEIGHT - 2 * BIRD_HEIGHT) {
        timeId = setInterval(() => {
            setBirdPosition(birdPosition => birdPosition + GRAVITY)
        }, 30)
    }
    return () => clearInterval(timeId)
  })

  useEffect(() => {
    let obstacleId;
    let counter;
    let obstacleHeight = Math.floor(Math.random() * (CANVAS_HEIGHT -  OBSTACLE_GAP));
    if(gameHasStarted && obstacleLeft >= -OBSTACLE_WIDTH) {
        obstacleId = setInterval(() => {
            setObstacleLeft(obstacleLeft => obstacleLeft - 15)
        }, 30)
        return () => clearInterval(obstacleId)
    }else {
        setObstacleLeft(CANVAS_WIDTH - OBSTACLE_WIDTH)
        setObstacleHeight(obstacleHeight)
        counter = (obstacleLeft >= -OBSTACLE_WIDTH) ? score : score + 1
        setScore(counter)
    }
  }, [gameHasStarted, obstacleLeft])

  useEffect(() => {
    const hasCollidedWithTopObstacle = birdPosition >= 0 && birdPosition < obstacleHeight
    const hasCollidedWithBottomObstacle = birdPosition < CANVAS_HEIGHT
        && birdPosition >= CANVAS_HEIGHT - bottomObstacleHeight
    if(obstacleLeft >= 0 && obstacleLeft <= OBSTACLE_WIDTH && (hasCollidedWithTopObstacle || hasCollidedWithBottomObstacle)) {
        hitSound.play()
        setGameOver(true)
        setGameHasStarted(false)
    }
  })

  const handleClick = () => {
      setGameOver(false)
      let newBirdPosition = birdPosition - JUMP_HEIGHT;
      if(!gameHasStarted) {
          setGameHasStarted(true)
      }
      else if(newBirdPosition < 0) {
          setBirdPosition(BIRD_HEIGHT)
      }
      else{
          setBirdPosition(newBirdPosition)
      }
  }

  useEffect(() => {
      window.addEventListener("keydown", (e) => e.key === " " && handleClick(e))
      return () => {
          window.removeEventListener("keydown", (e) => e.key === " " && handleClick(e))
      }
  }, [window.event])

  useEffect(() => {
          if (typeof defaultSound.loop == 'boolean')
          {
              defaultSound.loop = true;
          } else {
              defaultSound.addEventListener('ended', function() {
                  this.currentTime = 0;
                  this.play();
              }, false);
          }
          defaultSound.play()
  }, [gameHasStarted])

   useEffect(() => {
       !gameOver ? defaultSound.play() : defaultSound.pause()
       !gameOver && setScore(0)
   }, [gameOver])

  return (
    <div className="App">
        <Canvas height={CANVAS_HEIGHT} width={CANVAS_WIDTH} onClick={gameHasStarted ? handleClick : null}>
            {!gameHasStarted && <StartScreen height={CANVAS_HEIGHT} width={CANVAS_WIDTH}>
                <StartButton height={BUTTON_HEIGHT} width={BUTTON_WIDTH} onClick={() => {setGameHasStarted(true);
                    setGameOver(false)}}></StartButton>
            </StartScreen>}
            <TopObstacle top={0} width={OBSTACLE_WIDTH} height={obstacleHeight} left={obstacleLeft} />
            <Bird height={BIRD_HEIGHT} width={BIRD_WIDTH} positionTop={birdPosition} />
            <BottomObstacle top={CANVAS_HEIGHT - (obstacleHeight + bottomObstacleHeight + BIRD_HEIGHT)} width={OBSTACLE_WIDTH}
                      height={bottomObstacleHeight} left={obstacleLeft} bottomObstacle={true} />
            <ScoreBox>
                <span>{score}</span>
            </ScoreBox>
            {gameOver && <GameOver>
                <span><i>game over</i></span>
            </GameOver>}
        </Canvas>
    </div>
  );
}

export default App;

const StartScreen = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    buttom: 0;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    background-color: rgba(248, 247, 216, 0.7);
    z-index: 1;
    transition: background-color 2s ease-out;
`

const StartButton = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-image: url("images/playButton.png");
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    background-position: center;
    background-size: cover;
    cursor: pointer;
`

const Bird = styled.div`
      position: absolute;
      //background-color: red;
      height: ${(props) => props.height}px;
      width: ${(props) => props.width}px;
      top: ${(props) => props.positionTop}px;
      border-radius: 50%;
      background: url('images/animated.gif');
      background-size: 100% 100%;
`

const Canvas = styled.div`
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    background: url('images/background.png');
    background-size: 100% 100%;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    overflow: hidden;
`

const TopObstacle = styled.div`
    position: relative;
    top: ${(props) => props.top}px;
    background: url("images/box.png");
    background-size: 100%;
    width: ${(props) => props.width}px;
    height: ${props => props.height}px;
    transform: rotate(180deg);
    left: ${(props) => props.left}px;
`

const BottomObstacle = styled(TopObstacle)`
    transform: rotate(0deg);
    position: relative;
      &:before {
        content: "";
        background-image: url("images/grass.png");
        background-size: 100%;
        position: absolute;
        bottom: 0;
        left: -15px;
        width: calc(100% + 30px);
        height: 55px;
      }
`

const ScoreBox = styled.div`
    width: 100px;
    height: 140px;
    background-image: url("images/score.png");
    border-radius: 10px;
    background-size: cover;
    background-position: center;
    position: relative;
    left: calc(50% - 55px);
      & span {
        color: white;
        font-size: 24px;
        position: absolute;
        top: 21%;
        -moz-transform: scale(1) rotate(0deg) translate(0px, 0px) skew(15deg, 0deg);
        -webkit-transform: scale(1) rotate(0deg) translate(0px, 0px) skew(15deg, 0deg);
        -o-transform: scale(1) rotate(0deg) translate(0px, 0px) skew(15deg, 0deg);
        -ms-transform: scale(1) rotate(0deg) translate(0px, 0px) skew(15deg, 0deg);
        transform: scale(1) rotate(0deg) translate(0px, 0px) skew(15deg, 0deg);
      }
  z-index: 2;
`

const growDown = keyframes`
      0% {
        opacity: 0;
        transform: translateY(-10px)
      }
      50% {
        transform: translateY(-5px)
      }
      100% {
        opacity: 2;
        transform: translateY(0)
      }
`

const GameOver = styled.div`
      width: 200px;
      height: 100px;
      background-image: url('images/gameOver.png');
      background-position: center;
      background-size: cover;
      position: absolute;
      top: 0;
      left: calc(50% - 100px);
      display: flex;
      justify-content: center;
        & span {
          position: absolute;
          top: 60%;
          text-transform: uppercase;
          color: #ffffff;
          letter-spacing: 2px;
        }
      animation: ${growDown} 600ms ease-in-out forwards;
      z-index: 2;
`

