import React from "react";
import { Modal } from "../modal";
import { DirectorySelector } from "./directory-selector";

export type InitializationPageProps = {
    error: string | null;
};

export const InitializationPage = ({error}: InitializationPageProps) => {

    return (
        <Modal isOpen={true} setIsOpen={() => {}}>
            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-bold">Welcome to NotedAI!</h2>
                <p>{error}</p>
            </div>
        </Modal>
    )
}

