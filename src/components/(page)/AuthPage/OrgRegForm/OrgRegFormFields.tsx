import React from "react";
import {
    OrgBasicInfo,
    OrgTypeInfo,
    OrgContactInfo,
    OrgAccInfo,
    OrgDescInfo,
    OrgSponsorInfo,
    OrgStockInfo,
} from "./Fields";

const OrgRegFormFields : React.FC = () => {
    return (
        <>
        
            <OrgBasicInfo></OrgBasicInfo>
            <OrgTypeInfo></OrgTypeInfo>
            <OrgContactInfo></OrgContactInfo>
            <OrgStockInfo></OrgStockInfo>
            <OrgSponsorInfo></OrgSponsorInfo>
            <OrgDescInfo></OrgDescInfo>
            <OrgAccInfo></OrgAccInfo>
        </>
    );
};

export default OrgRegFormFields;
