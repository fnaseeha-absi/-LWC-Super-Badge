import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { LightningElement,wire,api } from 'lwc';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
// Custom Labels Imports
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
// Boat__c Schema Imports
import  BOAT_ID_FIELD  from "@salesforce/schema/Boat__c.Id";
import  BOAT_NAME_FIELD  from "@salesforce/schema/Boat__c.Name";
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends LightningElement {
  boatId;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  showFields=false;
  @wire(MessageContext) messageContext;

  @wire(getRecord,{recordId:'$boatId',fields:BOAT_FIELDS})
  wiredRecord;

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
      return this.wiredRecord.data ? 'utility:anchor' : null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if (this.subscription || this.recordId) {
        return;
      }
       // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  
      if (!this.subscription) {
        this.subscription = subscribe(
          this.messageContext,
          BOATMC,
          (message) => { this.boatId = message.recordId },
          {scope:APPLICATION_SCOPE}
        );
      }
  }
  
  // Calls subscribeMC()
  connectedCallback() {
      this.subscribeMC();
   }
  
  // Navigates to record page
  navigateToRecordViewPage() {
      this.showFields = !this.showFields;
   }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() { }
}
