public with sharing class FileUploadService {
    @AuraEnabled
    public static list<WrapperPOC> readCSVFile(Id idContentDocument){
        list<WrapperPOC> lstPocsToDisplay = new list<WrapperPOC>();
        list<POC_Object__c> lstPocObjsToInsert = new list<POC_Object__c>();
        if(idContentDocument != null) {
            
            // getting File Data based on document id 
            ContentVersion objVersion = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:idContentDocument WITH SECURITY_ENFORCED];
            // split the file data
            list<String> lstCSVLines = objVersion.VersionData.toString().split('\n');

            for(Integer i = 1; i < lstCSVLines.size(); i++){
                //(String accName,String date,Id lookup)
                list<String> csvRowData = lstCSVLines[i].split(',');
                System.debug('csvRowData====> '+csvRowData);
                String getLookup =  getLookupAccountId(csvRowData[1]);
                System.debug('getLookup==>'+getLookup);
                WrapperPOC objPoc = new WrapperPOC(csvRowData[1],date.parse(csvRowData[0]), getLookup);
                System.debug('objPoc'+objPoc);
                lstPocsToDisplay.add(objPoc);
                if(getLookup!= ''){
                    lstPocObjsToInsert.add(new POC_Object__c(POC_Date__c=objPoc.pocDate,Account__c=getLookup));
                }
            }

            try{    
                if(!lstPocObjsToInsert.isEmpty()) {
                    
                    //get lookup accountId
                    //insert to custom object
                    upsert lstPocObjsToInsert;
                }
            }
            catch (Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            } 
        }
        return lstPocsToDisplay;    
    }

    public static String getLookupAccountId(String accName){
        System.debug('accName: ' + accName);
        List<Account> accList = [SELECT Id,Name FROM Account WHERE Name = :accName WITH SECURITY_ENFORCED];
        String accId = '';
        System.debug('accList: ' + accList);
        if(accList != null && !accList.isEmpty()){
            accId = accList.get(0).Id;
        }
        
        return accId;
    }
    
    public class WrapperPOC {
        @AuraEnabled
        public String accName {get; set;}
        @AuraEnabled
        public Date pocDate {get; set;}
        @AuraEnabled
        public String lookupId {get; set;}
 
        //This is the contructor method. When we create a new wrapAccount object we pass a Account that is set to the acc property. We also set the selected value to false
        public WrapperPOC(String accNames,Date pocDates,String lookups) {
           accName= accNames;
           pocDate = pocDates;
           lookupId = lookups;
        }
    }
}
