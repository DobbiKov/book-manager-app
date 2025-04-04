import { createContext } from "react";
import { QuestionBoxCont } from "./questionBoxCont";

const QuestionContext = createContext(new QuestionBoxCont("", "", "", "", () => {}, () => {}, false));
const ShowCreateBookContext = createContext({
    show_add: false,
    setShow_add: () => {}
});

export { QuestionContext, ShowCreateBookContext };
