import { useContext } from "react";
import { QuestionContext } from "./contexts";



const QuestionBox = () => {
    const {cont, setCont} = useContext(QuestionContext);
    return(
        <div className={ `popup-overlay ${cont.is_active ? "" : "dontshow"}` }>
            <div className="popup-box">
                <h2>{cont.title}</h2>
                <p>{cont.main_text}</p>
                <div className="popup-buttons">
                    <button className="popup-btn confirm" onClick={cont.left_button_func}>{cont.left_button_text}</button>
                    <button className="popup-btn cancel" onClick={cont.right_button_func}>{cont.right_button_text}</button>
                </div>
            </div>
        </div>
    )
}
export default QuestionBox;
