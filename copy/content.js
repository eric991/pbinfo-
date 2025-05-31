// Functie care curata textul: inlocuieste caracterele ciudate cu spatiu
function sanitizeString(input) {
    return input.replace(/[^\x20-\x7E\n\r]/g, ' ');
}

// Verificam daca optiunea "copytoggle" e activata
chrome.storage.local.get("copytoggle", function(data) {
    if (data.copytoggle) {

        // Cautam toate elementele <pre> din zona cu id-ul "enunt"
        const preElements = document.querySelectorAll("#enunt > pre");

        // Daca gasim macar unul, continuam
        if (preElements && preElements.length != 0) {

            // Pentru fiecare <pre> gasit, adaugam un buton de copiere
            preElements.forEach((pre, index) => {
                pre.style.position = "relative"; // setam pozitia ca sa putem plasa butonul peste

                // Cream butonul de copiere
                const copyBtn = document.createElement("button");
                copyBtn.className = "my-copy-button"; // clasa pentru stil
                copyBtn.title = "Copiaza textul"; // tooltip

                // Iconita de pe buton (SVG pentru simbolul de copiere)
                copyBtn.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M10 1.5a.5.5 0 0 1 .5.5v.5h1A1.5 1.5 0 0 1 13 4v9.5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5V4a1.5 1.5 0 0 1 1.5-1.5h1V2a.5.5 0 0 1 .5-.5h4zM4 4v9.5c0 .276.224.5.5.5h7a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H9v1H7v-1H4.5A.5.5 0 0 0 4 4z"/>
      </svg>
    `;

                // Cand se apasa butonul
                copyBtn.addEventListener("click", () => {
                    const textToCopy = sanitizeString(pre.innerText); // curatam textul
                    navigator.clipboard.writeText(textToCopy); // copiem in clipboard
                    console.log(textToCopy); // afisam in consola (doar pentru test)

                    // Adaugam o mica animatie cand se apasa butonul
                    copyBtn.classList.add("pressed-animation");
                    setTimeout(() => {
                        copyBtn.classList.remove("pressed-animation");
                    }, 300);
                });

                // Adaugam butonul in <pre>
                pre.appendChild(copyBtn);
            });
        }

    }
});

