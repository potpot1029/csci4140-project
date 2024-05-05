import React from "react";
import { Modal } from "../modal";
import { DirectorySelector } from "./directory-selector";


export const InitializationPage = () => {
    const [error, setError] = React.useState<string | null>(null);

    return (
        <Modal isOpen={true} setIsOpen={() => {}}>
            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-bold">Welcome to TwoBrains!</h2>
                <p className="text-sm">TwoBrains is a note-taking app that allows you to take notes in markdown format.</p>
                <p className="text-sm">Choose you vault directory first to use the App</p>
                <DirectorySelector setError={setError} />
                <p className="text-sm">Note that only markdown files will be indexed</p>
            </div>
        </Modal>
    )
}

