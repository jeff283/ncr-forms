const currentYear = new Date().getFullYear();

async function getNCRFormID(){
    try{
        const response = await fetch('api/ncrForms');

        if(!response.ok){
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        return data.length + 1;
    }
    catch(error){
        console.error('Error regarding quality form ID generation', error);
        throw error;
    }
}

// Gets code and validates it against business rule
async function getNCRCode(){
    try{
        const ncrCode = await generateCode();

        if(ncrCode >= 1000){
            throw new Error('Error: NCR code breaks requirements.');
        }
        return ncrCode.toString().padStart(3, '0');
    }
    catch(error){
        console.error('Error with generating NCR code:', error);
        throw error;
    }
}

// Function which generates 3 digit NCR code. ie 001, 002, 003
async function generateCode(){
    try{
        const response = await fetch('api/ncrForms');

        if(!response.ok){
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();

        const currentYear = new Date().getFullYear();
        
        const filteredItems = data.items.filter(ncrData => {
            const issueYear = new Date(ncrData.ncrIssueDate).getFullYear();
            return issueYear === currentYear;
        });
        return filteredItems.length + 1;
    }
    catch(error){
        console.error('Error fetching NCR forms to create new NCR number:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async function(){

        // Setting dates
        document.getElementById('quality-rep-date').value = new Date().toISOString().substring(0, 10); 
        document.getElementById('ncr-date').value = new Date().toISOString().substring(0, 10);
        document.getElementById('revision-date').value = new Date().toISOString().substring(0, 10);
        document.getElementById('engineer-date').value = new Date().toISOString().substring(0, 10);
        document.getElementById('purchasing-date').value = new Date().toISOString().substring(0, 10);

        // Set NCR No and Stage
        document.getElementById('ncr-no').value = currentYear + "-" + await getNCRCode();  // Function in create quality script
        // Switch for formatting status code to be readable
        switch(sessionStorage.getItem('currentNCRStage')){ 
            case "QUA": document.getElementById('stage').value = "Quality";
                break;
            case "ENG": document.getElementById('stage').value = "Engineering";
                break;
            case "PUR": document.getElementById('stage').value = "Purchasing";
        } 

        // Setting quality rep name
        if(sessionStorage.getItem('userName')){
            document.getElementById('quality-rep-name').value = sessionStorage.getItem('userName');
        } else {
            document.getElementById('quality-rep-name').value = "Quality Rep";
        }

        
        if((!document.getElementById('engineering').value) && ((sessionStorage.getItem("userRole") == "Administrator") || (sessionStorage.getItem("userRole") == "Engineering"))){
            document.getElementById('engineering').value = sessionStorage.getItem('userName');
            document.getElementById('engineer-date').value = new Date().toISOString().substring(0, 10);
        }

        if((!document.getElementById('purchasing').value) && ((sessionStorage.getItem("userRole") == "Administrator") || (sessionStorage.getItem("userRole") == "Purchasing"))){
            document.getElementById('purchasing').value = sessionStorage.getItem('userName');
            document.getElementById('purchasing-date').value = new Date().toISOString().substring(0, 10);
        }
});


