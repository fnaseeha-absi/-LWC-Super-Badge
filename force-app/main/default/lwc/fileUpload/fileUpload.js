import { LightningElement, track, api } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import readCSVFile from '@salesforce/apex/FileUploadService.readCSVFile';
const columns = [
    { label: 'Account', fieldName: 'Account__c' }, 
    { label: 'POC Date', fieldName: 'POC_Date__c' },
   
];


export default class FileUpload extends LightningElement {
    @api recordId;
    @track error;
  //  @track columns = columns;
    @track data;

    // accepted parameters
    get acceptedFormats() {
        return ['.csv'];
    }
    
    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        console.log('uploadedFiles',uploadedFiles);

        console.log('file',uploadedFiles[0].documentId);
        // calling apex class
        readCSVFile({idContentDocument : uploadedFiles[0].documentId})
        .then(result => {
            window.console.log('result ===> ',result);
            this.data = result;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Accounts are created based CSV file!!!',
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!!',
                    message: JSON.stringify(error),
                    variant: 'error',
                }),
            );     
        })

    }
}