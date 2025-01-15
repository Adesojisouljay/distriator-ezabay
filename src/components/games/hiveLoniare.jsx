//We will revist this later
import React, { useEffect, useState } from "react";
import hiveQuestions from "../../vairables/hiveQAWithCat.json";
import "./hiveloniare.scss";

export const HivelionaireGame = () => {
  const shuffledQuestions = shuffleArray(hiveQuestions).slice(0, 15);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.log(currentQuestion);
  }, []);

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  const handleAnswerClick = (answer) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);

    if (answer === shuffledQuestions[currentQuestionIndex].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < shuffledQuestions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setGameOver(true);
      }
    }, 1000);
  };

  if (gameOver) {
    return (
      <div className="quizContainer">
        <h2 className="gameOver">Game Over!</h2>
        <p>Your score: {score} / {shuffledQuestions.length}</p>
        <button className="restartButton" onClick={() => window.location.reload()}>
          Restart
        </button>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div className="quizContainer">
      <h1>Who Wants to Be a Hivelionaire?</h1>
      <h2>You now have {score} Reqards in Hive</h2>
      <h2>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</h2>
      <p className="category"><strong>Category:</strong> {currentQuestion.category}</p>
      <p className="questionBox">{currentQuestion.question}</p>
      <div className="answers">
        {currentQuestion.options?.map((answer, index) => (
            <button
            key={index}
            className={`answerButton ${
                selectedAnswer
                ? answer === currentQuestion.correct
                    ? 'correct'
                    : answer === selectedAnswer
                    ? 'wrong'
                    : ''
                : ''
            }`}
            onClick={() => handleAnswerClick(answer)}
            disabled={selectedAnswer}
            >
            {answer}
            </button>
  ))}
        </div>
    </div>
  );
};
