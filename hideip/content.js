// Functie care returneaza un element din pagina pe baza unui path XPath
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Verificam daca optiunea de ascundere a IP-ului este activata
chrome.storage.local.get("hideip", function(data) {
    if (data.hideip) {
        // Daca da, cautam elementul care contine IP-ul din footer
        const targetElement = getElementByXpath('//*[@id="footer"]/div/div/div/div[3]/span');

        // Si il stergem din pagina
        targetElement.remove();
    }
});

