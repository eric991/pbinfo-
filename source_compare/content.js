async function main() {
    // Functie utilitara pentru a gasi elemente cu XPath
    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // Curata textul de caractere inutile: spatii, acolade, punct si virgula, newline-uri
    function remove_extras(str) {
        if (typeof str === 'string' || str instanceof String){
            str = str.replaceAll(' ', '');
            str = str.replaceAll(';', '');
            str = str.replaceAll('{', '');
            str = str.replaceAll('}', '');
            str = str.replaceAll('\n', '');
        }
        return str;
    }

    // Functie care descarca continutul unei pagini dintr-un link (href)
    async function fetchTextFromHref(href) {
        try {
            let response = await fetch(href);
            let text = await response.text();
            let parser = new DOMParser();
            let doc = parser.parseFromString(text, "text/html");
            // Extrage codul sursa din elementul #sursa pre
            return doc.querySelector("#sursa pre")?.innerText.trim() || "";
        } catch (error) {
            console.error("Eroare la descarcarea codului sursa: ", error);
            return "";
        }
    }

    // Calculeaza similaritatea intre 2 siruri de caractere (coduri)
    function getSimilarity(str1, str2) {
        str1 = remove_extras(str1);
        str2 = remove_extras(str2);
        if(!(typeof str1 === 'string' || str1 instanceof String) || !(typeof str2 === 'string' || str2 instanceof String)){
            return 0;
        }
        let cnt_same = 0;
        let smaller, bigger;
        // Identifica sirul mai mic si cel mai mare
        if (str1.length <= str2.length) {
            smaller = str1;
            bigger = str2;
        } else {
            smaller = str2;
            bigger = str1;
        }
        smaller = smaller.toLowerCase();
        bigger = bigger.toLowerCase();

        // Verifica cate caractere sunt identice pe aceeasi pozitie in sirul mic si cel mare
        for (let i = 0; i < smaller.length; i++) {
            if (bigger[i] == smaller[i]) {
                cnt_same++;
            }
        }

        // Daca peste 80% dintre caracterele in ordine coincid, returneaza scorul
        if (cnt_same / smaller.length >= 0.8) {
            return cnt_same / smaller.length * 100;
        }

        // Altfel, verifica similaritatea in functie de frecventa caracterelor (indiferent de ordine)
        let cnt_dif = 0;
        let f_smaller = {}, f_bigger = {};
        for (let i = 0; i < smaller.length; i++) {
            f_smaller[smaller[i]] = (f_smaller[smaller[i]] || 0) + 1;
        }
        for (let i = 0; i < bigger.length; i++) {
            f_bigger[bigger[i]] = (f_bigger[bigger[i]] || 0) + 1;
        }
        let toate = new Set([...Object.keys(f_smaller), ...Object.keys(f_bigger)]);
        for (let chr of toate) {
            let cnt_smaller = f_smaller[chr] || 0;
            let cnt_bigger = f_bigger[chr] || 0;
            cnt_dif += Math.abs(cnt_smaller - cnt_bigger);
        }

        // Daca similaritatea bazata pe frecventa e peste 70%, returneaza procentul
        if ((1 - (cnt_dif / bigger.length)) >= 0.7) {
            return (1 - (cnt_dif / bigger.length)) * 100;
        }

        // Daca nu, foloseste o functie externa (din libraria stringSimilarity) sa calculeze similaritatea (daca e definita)
        return stringSimilarity.compareTwoStrings(str1, str2) * 100;
    }

    // Selectam toate randurile din tabelul cu elevi
	let tableRows = document.querySelectorAll("#lista_elevi tbody tr");

	// Creem arrays pentru a tine textele descarcate, linkurile, valorile de similaritate si indexul celui mai apropiat elev
	let texts = Array.from({ length: tableRows.length }, () => []);
	let links = Array.from({ length: tableRows.length }, () => []);
	let maValues = Array.from({ length: tableRows.length }, () => []);
	let maIndices = Array.from({ length: tableRows.length }, () => []);

	// Lista cu promisiuni pentru descarcarea tuturor codurilor sursa
	let textPromises = [];

	// Parcurgem fiecare rand (elev)
	tableRows.forEach((row, rowIndex) => {
		let cells = Array.from(row.querySelectorAll("td")).slice(3); // Sarim primele 3 coloane, luam restul cu linkuri
		let rowLinks = cells.map(cell => {
		    let aTags = Array.from(cell.querySelectorAll("a"));
		    return aTags[aTags.length - 1]; // Luam doar ultimul link din celula (ultima solutie)
		}).filter(link => link); // Eliminam valori nule

		// Pentru fiecare link din randul curent, il pastram si initiem fetch-ul pentru cod
		rowLinks.forEach((link, linkIndex) => {
			links[rowIndex][linkIndex] = link; 
			maValues[rowIndex][linkIndex] = 0; 
			maIndices[rowIndex][linkIndex] = 0; 
			textPromises.push(
				fetchTextFromHref(link.href).then(text => {
					texts[rowIndex][linkIndex] = text; // Salvam codul descarcat
				})
			);
		});
	});

	// Asteptam ca toate codurile sa fie descarcate inainte de a compara
	await Promise.all(textPromises);

	// Comparare coduri intre toti elevii, pentru fiecare problema
	for (let i = 0; i < texts.length; i++) { // elevul 1
		for (let k = 0; k < texts[i].length; k++) { // problema
			for (let j = 0; j < texts.length; j++) { // elevul 2
				if (i !== j) {
					let similarity = getSimilarity(texts[i][k], texts[j][k]);
					// Retinem cea mai mare similaritate gasita si elevul cu care s-a comparat
					if (similarity > maValues[i][k]) {
						maValues[i][k] = similarity;
						maIndices[i][k] = j + 1; // indexul elevului gasit, +1 pentru afisare mai prietenoasa
					}
				}
			}
		}
	}

	// Afisam rezultatele sub fiecare link (culoare verde -> rosu in functie de procent)
	for (let i = 0; i < texts.length; i++) {
		for (let k = 0; k < texts[i].length; k++) {
			let ma = maValues[i][k].toFixed(2);
			let ma_i = maIndices[i][k];
			let similarityDisplay = document.createElement("div");
			similarityDisplay.style.fontSize = "12px";
			let red = (Math.floor(ma / 100 * ma / 100 * 255)).toString(16).padStart(2, '0');
			let green = (Math.floor((1 - ma / 100) * (1 - ma / 100) * 255)).toString(16).padStart(2, '0');
			
			similarityDisplay.style.color = "#" + red + green + "00";
			similarityDisplay.innerText = `Similaritatea cu ${ma_i}: ${ma}%`;
			
			// Punem textul imediat dupa linkul cu codul sursa
			if (links[i][k]) {
				links[i][k].parentNode.insertBefore(similarityDisplay, links[i][k].nextSibling);
			}
		}
	}
}

function addVerificationButton() {
    // Gasim tabelul cu elevi folosind XPath
    let tableElement = getElementByXpath('//*[@id="lista_elevi"]');
    
    if (tableElement) {
        // Cream un buton pentru verificarea similaritatii
        let button = document.createElement("button");
        button.innerText = "Verifica similaritatea";
        button.style.marginBottom = "10px"; // Distanta fata de tabel
        button.style.fontSize = "16px";
        button.style.padding = "10px 20px";
        button.style.cursor = "pointer";
        
        // Cand apasam butonul, stergem butonul si rulam functia principala
        button.addEventListener("click", async () => {
			if (button) {
				button.remove();
			}
            await main();
        });

        // Inseram butonul chiar deasupra tabelului
        tableElement.parentNode.insertBefore(button, tableElement);
    }
}

addVerificationButton();

