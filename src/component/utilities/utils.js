export const shorten_address = (address) => {
    return address.startsWith("0x")?`${address.slice(0,5)}...${address.slice(-3)}`:address
}