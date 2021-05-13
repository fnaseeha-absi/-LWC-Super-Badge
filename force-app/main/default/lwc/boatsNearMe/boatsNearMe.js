import { LightningElement, track,wire,api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
    
    @api boatTypeId;
    @track mapMarkers = [];
    @track isRendered = false;
    @track latitude;
    @track longitude;
    @track isLoading = true;

    @wire(getBoatsByLocation,{latitude:'$latitude',longitude:'$longitude',boatTypeId:'$boatTypeId'})
    wiredBoatsJSON({error, data}){
        if(data){
           this.createMapMarkers(JSON.parse(data));
            
        }else if(error){
            const event = new ShowToastEvent({
                title: ERROR_TITLE,
                variant: ERROR_VARIANT,
                message: error.body.message,
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
            this.isLoading = false;
            this.mapMarkers = [];
        }
    } 

    createMapMarkers(boatData){
    
        this.mapMarkers = boatData.map((rowBoat)=>{
        return {
            location: {
                Latitude: rowBoat.Geolocation__Latitude__s,
                Longitude: rowBoat.Geolocation__Longitude__s
            },
            title: rowBoat.Name
            };
        });
      
        this.mapMarkers.unshift({
            location : { 
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title : LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        this.isLoading = false;

    }
    renderedCallback(){
        if(this.isRendered==false){
            this.getLocationFromBrowser();
        }
       this.isRendered = true;
    }

    getLocationFromBrowser (){

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {

                // Get the Latitude and Longitude from Geolocation API
                 this.latitude = position.coords.latitude;
                 this.longitude = position.coords.longitude;
            });
        }
    }
}