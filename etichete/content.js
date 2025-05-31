// Functie care gaseste un element din DOM folosind un path XPath
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Elementul care contine etichetele
const targetElement = getElementByXpath('//*[@id="zona-mijloc"]/div/div[5]');

// Elementul care arata punctajul (folosit sa vedem daca ai 100 de puncte)
const scoreElement = getElementByXpath('//*[@id="zona-mijloc"]/div/table/tbody/tr[2]/td[9]/div/a');

// Functia principala care face toata logica
async function initialize() {

	const url = window.location.href;

	// Verificam daca suntem pe o pagina de problema de pe pbinfo
	const regex = new RegExp("https://www\\.pbinfo\\.ro/probleme/[0-9]+/[A-Za-z0-9]+.*");
	if (!regex.test(url)) {
		return; // daca nu suntem pe pagina corecta, iesim
	}

    if (targetElement) {
        // Luam din storage daca userul vrea sa afiseze etichetele mereu
		const result_etichete = await new Promise(resolve => {
			chrome.storage.local.get("show_etichete", resolve);
		});
		let show_etichete = result_etichete.show_etichete;
        
        // Verificam si daca optiunea cu "ascunde etichetele la 100 de puncte" e activata
        const result = await new Promise(resolve => {
            chrome.storage.local.get("hide100", resolve);
        });
        let hide100 = result.hide100 ?? 0; 
        console.log("hide100:", hide100);

        // Determinam daca trebuie afisate etichetele automat sau nu
        let autoShow = (scoreElement && (scoreElement.innerText.trim() === "100" && hide100 == 0)) || show_etichete; 

        // Cream containerul vizual pentru switch-ul custom
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "10px"; 
        container.style.fontFamily = "Arial, sans-serif";
        container.style.fontSize = "14px";

        // Eticheta si switch-ul
        const label = document.createElement("label");
        label.style.display = "inline-flex";
        label.style.alignItems = "center";
        label.style.cursor = "pointer";

        // Inputul real (checkbox), dar e ascuns
        const input = document.createElement("input");
        input.type = "checkbox";
        input.style.display = "none"; 

        // Switch-ul vizual (fundal)
        const switchSpan = document.createElement("span");
        switchSpan.style.width = "34px";
        switchSpan.style.height = "18px";
        switchSpan.style.background = autoShow ? "#007bff" : "#ccc"; // albastru daca e activ
        switchSpan.style.borderRadius = "34px";
        switchSpan.style.position = "relative";
        switchSpan.style.transition = "background 0.3s";

        // Bulina alba din switch
        const circle = document.createElement("span");
        circle.style.position = "absolute";
        circle.style.width = "14px";
        circle.style.height = "14px";
        circle.style.background = "white";
        circle.style.borderRadius = "50%";
        circle.style.top = "2px";
        circle.style.left = autoShow ? "18px" : "2px"; 
        circle.style.transition = "left 0.3s";

        // Asamblam switch-ul
        switchSpan.appendChild(circle);
        label.appendChild(input);
        label.appendChild(switchSpan);

        // Textul de langa switch
        const textLabel = document.createElement("span");
        textLabel.innerText = "Afiseaza etichetele";
        textLabel.style.marginLeft = "10px";

        // Adaugam totul in container
        container.appendChild(label);
        container.appendChild(textLabel);

        // Afisam sau ascundem etichetele in functie de setare
        targetElement.style.display = autoShow ? "block" : "none";
        input.checked = autoShow;

        // Cand utilizatorul da click pe switch
        input.addEventListener("change", () => {
            if (input.checked) {
                targetElement.style.display = "block";
                switchSpan.style.background = "#007bff";
                circle.style.left = "18px";
            } else {
                targetElement.style.display = "none";
                switchSpan.style.background = "#ccc";
                circle.style.left = "2px";
            }
        });

        // Adaugam totul inainte de blocul cu etichetele
        targetElement.parentNode.insertBefore(container, targetElement);
    }
}

// Apelam functia cand se incarca pagina
initialize();

