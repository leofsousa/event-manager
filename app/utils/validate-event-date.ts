export function validateEventDateInTravel(
    eventDate: string,
    dataSaida: string,
    dataRetorno: string,
) {
    return (
        eventDate >= dataSaida &&
        eventDate <= dataRetorno
    );
}