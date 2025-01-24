import { createContext } from "react";
import { QuestionBoxCont } from "./questionBoxCont";

const QuestionContext = createContext(new QuestionBoxCont("", "", "", "", () => {}, () => {}, false));
const ShowCreateBookContext = createContext(false);

export { QuestionContext, ShowCreateBookContext };
