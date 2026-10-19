import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const cats = [["education","Education","book-open"],["faith","Faith & Spirituality","church"],["music","Music","music"],
  ["art","Art","palette"],["writing","Writing","pen-line"],["technology","Technology","cpu"],
  ["podcasting","Podcasting","mic"],["gaming","Gaming","gamepad"],["other","Other","sparkles"]];
const samples = [
  ["sample-teacher","Sample Teacher","education","Sample page for development. Weekly lessons and worksheets.",true],
  ["sample-choir","Sample Worship Choir","music","Sample page for development. Original worship songs.",true],
  ["sample-writer","Sample Writer","writing","Sample page for development. Essays on life in Addis.",false],
] as const;
async function main() {
  for (const [i,[slug,name,icon]] of cats.entries())
    await db.category.upsert({ where:{slug}, update:{name,icon,sort:i}, create:{slug,name,icon,sort:i} });
  const owner = await db.user.upsert({ where:{email:"sample@zupport.app"}, update:{},
    create:{ email:"sample@zupport.app", name:"Sample Owner", passwordHash:"!disabled", role:"CREATOR" } });
  for (const [username,displayName,cat,bio,featured] of samples) {
    const category = await db.category.findUnique({ where:{slug:cat} });
    const page = await db.creatorPage.upsert({ where:{username}, update:{},
      create:{ ownerId:owner.id, username, displayName, bio, categoryId:category!.id, country:"Ethiopia", status:"ACTIVE", featured } });
    if (!(await db.tier.findFirst({ where:{pageId:page.id} }))) {
      const tier = await db.tier.create({ data:{ pageId:page.id, name:"Supporter", priceMinor:15000, description:"Members-only posts and early access.", benefits:["Members-only posts","Early access"] } });
      await db.post.createMany({ data:[
        { pageId:page.id, title:"Welcome", excerpt:"A public hello.", body:"Welcome to my page. This is a sample public article.", published:true, publishedAt:new Date() },
        { pageId:page.id, title:"Members-only lesson", body:"Hidden until membership exists.", tierId:tier.id, published:true, publishedAt:new Date() },
      ]});
    }
  }
}
main().finally(() => db.$disconnect());
