import { useEffect, useState } from "react";
import frasesFooter from "../data/frasesFooter";

export default function useRandomPhrase() {
    const [frase, setFrase] = useState("");

    useEffect(() => {
        const cambiarFrase = () => {
            const random =
                frasesFooter[Math.floor(Math.random() * frasesFooter.length)];

            setFrase(random);
        };
        cambiarFrase();

        const interval = setInterval(cambiarFrase, 120000);
        return () => clearInterval(interval);

    }, []);

    return frase;
}
