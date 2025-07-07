type claimsArrayType = ["id", "ethAddress", "name", "age", "roll number", "department", "branch"];
type credentialsObjectType = { [key in claimsArrayType[number]]: string };
