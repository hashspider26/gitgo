import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const url = "libsql://greenvalleyseeds-hashspider.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc1ODQ5NDYsImlkIjoiZTE1ODBkNzYtMjkzYi00NjhiLTk3MWQtNDBhOTVjODc4MmM4IiwicmlkIjoiNWNjMWY2NGItZjU4My00ZDIyLWExMjItYTVjZjc2MGJlNzQ4In0.vU6JeKE8X1pfkidDMHmT6XFRKGY35AwugB-MRIgWMhiRCAtpTyqE6i5Dis2t8pahFFyrCKGyize-wvXYNgI0BQ";

const libsql = createClient({ url, authToken });
const adapter = new PrismaLibSQL(libsql);

console.log("Adapter keys:", Object.keys(adapter));
console.log("Adapter prototype keys:", Object.keys(Object.getPrototypeOf(adapter)));
console.log("queryRaw:", typeof (adapter as any).queryRaw);
console.log("executeRaw:", typeof (adapter as any).executeRaw);
console.log("provider:", (adapter as any).provider);
