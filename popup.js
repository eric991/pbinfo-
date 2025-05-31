// Asteptam ca toata pagina (DOM-ul) sa fie incarcata
document.addEventListener("DOMContentLoaded", function() {

    // Luam referinta la fiecare checkbox din popup (butoanele de optiuni)
    let hide100_button = document.getElementById("hide100");
    let show_etichete_button = document.getElementById("show_etichete");
    let copytoggle_button = document.getElementById("copytoggle");
    let hideip_button = document.getElementById("hideip");

    // Verificam daca optiunea "hide100" este salvata ca activa
    chrome.storage.local.get("hide100", function(data) {
        if (data.hide100) {
            hide100_button.checked = true; // bifam butonul daca era salvat ca activ
        }
    });

    // La fel si pentru "show_etichete"
    chrome.storage.local.get("show_etichete", function(data) {
        if (data.show_etichete) {
            show_etichete_button.checked = true;
        }
    });

    // La fel si pentru "copytoggle"
    chrome.storage.local.get("copytoggle", function(data) {
        if (data.copytoggle) {
            copytoggle_button.checked = true;
        }
    });

    // La fel si pentru "hideip"
    chrome.storage.local.get("hideip", function(data) {
        if (data.hideip) {
            hideip_button.checked = true;
        }
    });

    // Cand utilizatorul modifica starea butonului "hide100"
    hide100_button.addEventListener('change', function() {
        // Dam refresh la pagina activa din tab-ul curent
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
        });

        // Salvam noua stare (1 = activat, 0 = dezactivat)
        chrome.storage.local.set({
            hide100: this.checked ? 1 : 0
        });
    });

    // La fel si pentru "show_etichete"
    show_etichete_button.addEventListener('change', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
        });
        chrome.storage.local.set({
            show_etichete: this.checked ? 1 : 0
        });
    });

    // Pentru "copytoggle"
    copytoggle_button.addEventListener('change', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
        });
        chrome.storage.local.set({
            copytoggle: this.checked ? 1 : 0
        });
    });

    // Si pentru "hideip"
    hideip_button.addEventListener('change', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
        });
        chrome.storage.local.set({
            hideip: this.checked ? 1 : 0
        });
    });

});

