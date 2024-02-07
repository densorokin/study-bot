const questions = require("./questions.json");

const getRandomQuestion = (topic) => {
  let questionTopic = topic.toLowerCase();

  if (topic === "random question") {
    const questionTopicsKeys = Object.keys(questions);
    const randomTopicIndex = Math.floor(
      Math.random() * (questionTopicsKeys.length - 1)
    );
    questionTopic = questionTopicsKeys[randomTopicIndex];
  }

  const randomQuestionIndex = Math.floor(
    Math.random() * questions[questionTopic].length
  );
  debugger;
  return {
    question: questions[questionTopic][randomQuestionIndex],
    questionTopic,
  };
};

const getCorrectAnswer = (id, topic) => {
  const question = questions[topic].find((question) => question.id === id);

  if (!question.hasOptions) {
    return question.answer;
  }

  return question.options.find((option) => option.isCorrect).text;
};

module.exports = {
  getRandomQuestion,
  getCorrectAnswer,
};
