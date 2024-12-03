import { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import 'primereact/resources/themes/saga-blue/theme.css'; // Usa il tema che preferisci
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'; // Aggiungi icone se necessarie
import './carousel.scss';


interface ImageType {
    id: number;
    src: string;
    name: string;
}

interface SponsorCarouselProps {
    defaultImages: ImageType[];
    defaultDisplayDuration: number;
    defaultSequentialMode: boolean;
    scrollDirection: 'horizontal' | 'vertical';
}

const SponsorCarousel: React.FC<SponsorCarouselProps> = ({
    defaultImages,
    defaultDisplayDuration,
    defaultSequentialMode,
    scrollDirection,
}) => {
    // Imposta la durata dell'intervallo per il carosello
    const itemTemplate = (item: ImageType) => {
        return (
            <div className="carousel-item">
                <img src={item.src} alt={item.name} />
            </div>
        );
    };



    return (
        <div className={`carousel-wrapper ${scrollDirection}`}>
            <Carousel
                value={defaultImages}
                numVisible={1}
                numScroll={1}
                circular={defaultSequentialMode} // Modalità sequenziale
                autoplayInterval={defaultDisplayDuration} // Durata per ciascuna immagine
                itemTemplate={itemTemplate} // Funzione per renderizzare l'elemento
                className={`carousel ${scrollDirection}`} // Cambia la direzione con la classe
                showIndicators={false} // Rimuove gli indicatori del carosello
                showNavigators={false} // Rimuove i bottoni di navigazione (o usa navigation={false})
            />
        </div>
    );
};


export default SponsorCarousel;
