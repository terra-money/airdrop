import { ReactNode } from "react";
import "./Loader.scss";

type LoaderProps = {
    bottomElement?: ReactNode
};

export const Loader = (props: LoaderProps) => {
    return (
        <div className="LoaderWrapper">
            <div className="Loader">
                <div className="LoaderAnimation">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            {props.bottomElement}
        </div>
    );
}