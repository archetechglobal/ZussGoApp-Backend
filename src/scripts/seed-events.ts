import { prisma } from "../config/prisma_client.ts";
 
const events = [
  // JANUARY
  { name: "Pongal", emoji: "🌾", destination: "Tamil Nadu", destinationSlug: null, dates: "Jan 14-17", month: 1, tag: "Harvest", description: "Tamil harvest festival with kolam art and Jallikattu" },
  { name: "Republic Day", emoji: "🇮🇳", destination: "Delhi", destinationSlug: null, dates: "Jan 26", month: 1, tag: "National", description: "Grand parade on Kartavya Path" },
  { name: "Jaipur Lit Fest", emoji: "📖", destination: "Jaipur", destinationSlug: "jaipur", dates: "Jan 23-27", month: 1, tag: "Literary", description: "World's largest free literary festival" },
  { name: "Rann Utsav", emoji: "🏜️", destination: "Kutch", destinationSlug: null, dates: "Nov-Feb", month: 1, tag: "Cultural", description: "White desert festival under full moon" },
 
  // FEBRUARY
  { name: "Goa Carnival", emoji: "🎭", destination: "Goa", destinationSlug: "goa", dates: "Feb 14-17", month: 2, tag: "Cultural", description: "4 days of street parades, music and masks" },
  { name: "Jaisalmer Desert Fest", emoji: "🐪", destination: "Jaisalmer", destinationSlug: null, dates: "Feb 21-23", month: 2, tag: "Cultural", description: "Camel races and Rajasthani folk performances" },
  { name: "Khajuraho Dance Fest", emoji: "💃", destination: "Madhya Pradesh", destinationSlug: null, dates: "Feb 20-26", month: 2, tag: "Dance", description: "Classical dance performances at ancient temples" },
  { name: "Maha Shivaratri", emoji: "🕉️", destination: "All India", destinationSlug: null, dates: "Feb 17", month: 2, tag: "Spiritual", description: "Night of Lord Shiva, celebrated at temples nationwide" },
 
  // MARCH
  { name: "Holi", emoji: "🎨", destination: "All India", destinationSlug: null, dates: "Mar 4", month: 3, tag: "Festival", description: "Festival of Colors — Mathura & Vrindavan are iconic" },
  { name: "Shigmo Festival", emoji: "🎉", destination: "Goa", destinationSlug: "goa", dates: "Mar 14-28", month: 3, tag: "Cultural", description: "Goa's spring festival with colorful float parades" },
  { name: "Ram Navami", emoji: "🛕", destination: "All India", destinationSlug: null, dates: "Mar 27", month: 3, tag: "Spiritual", description: "Birth of Lord Rama, celebrated in Ayodhya" },
  { name: "Eid ul-Fitr", emoji: "🌙", destination: "All India", destinationSlug: null, dates: "Mar 30", month: 3, tag: "Festival", description: "End of Ramadan, celebrated with feasts and prayers" },
  { name: "Chapchar Kut", emoji: "🎋", destination: "Mizoram", destinationSlug: null, dates: "Mar 6", month: 3, tag: "Cultural", description: "Mizo spring festival with bamboo dances" },
 
  // APRIL
  { name: "Baisakhi", emoji: "🌾", destination: "Punjab", destinationSlug: null, dates: "Apr 13", month: 4, tag: "Harvest", description: "Sikh New Year and Punjab harvest festival" },
  { name: "Tulip Festival", emoji: "🌷", destination: "Kashmir", destinationSlug: null, dates: "Apr 1-15", month: 4, tag: "Nature", description: "Asia's largest tulip garden in full bloom" },
  { name: "Mahavir Jayanti", emoji: "🕉️", destination: "All India", destinationSlug: null, dates: "Apr 10", month: 4, tag: "Spiritual", description: "Birth anniversary of Lord Mahavir" },
  { name: "Bihu", emoji: "🎶", destination: "Assam", destinationSlug: null, dates: "Apr 14-15", month: 4, tag: "Cultural", description: "Assamese New Year with folk dances and feasts" },
 
  // MAY
  { name: "Buddha Purnima", emoji: "🧘", destination: "All India", destinationSlug: null, dates: "May 12", month: 5, tag: "Spiritual", description: "Birth of Gautama Buddha, special at Bodh Gaya" },
  { name: "Shimla Summer Fest", emoji: "🎶", destination: "Shimla", destinationSlug: "shimla", dates: "May 20-25", month: 5, tag: "Music", description: "Cultural programs and flower shows in the hills" },
  { name: "Saga Dawa", emoji: "🙏", destination: "Sikkim", destinationSlug: null, dates: "May 23", month: 5, tag: "Spiritual", description: "Buddhist festival celebrating Buddha's enlightenment" },
 
  // JUNE
  { name: "Hemis Festival", emoji: "🎭", destination: "Ladakh", destinationSlug: "ladakh", dates: "Jun 17-18", month: 6, tag: "Cultural", description: "Spectacular Buddhist mask dances at Hemis monastery" },
  { name: "Rath Yatra", emoji: "🛕", destination: "Puri", destinationSlug: null, dates: "Jun 26", month: 6, tag: "Spiritual", description: "Grand chariot procession of Lord Jagannath" },
  { name: "Eid ul-Adha", emoji: "🌙", destination: "All India", destinationSlug: null, dates: "Jun 7", month: 6, tag: "Festival", description: "Festival of Sacrifice" },
 
  // JULY
  { name: "Ladakh Festival", emoji: "🏔️", destination: "Ladakh", destinationSlug: "ladakh", dates: "Jul 1-15", month: 7, tag: "Cultural", description: "Showcasing Ladakhi heritage, polo, archery" },
  { name: "Bonalu", emoji: "🪔", destination: "Hyderabad", destinationSlug: null, dates: "Jul 14", month: 7, tag: "Festival", description: "Telugu festival honoring Goddess Mahakali" },
 
  // AUGUST
  { name: "Independence Day", emoji: "🇮🇳", destination: "All India", destinationSlug: null, dates: "Aug 15", month: 8, tag: "National", description: "India's Independence Day — parade at Red Fort" },
  { name: "Raksha Bandhan", emoji: "🎀", destination: "All India", destinationSlug: null, dates: "Aug 18", month: 8, tag: "Festival", description: "Bond of brother-sister love" },
  { name: "Onam", emoji: "🌸", destination: "Kerala", destinationSlug: "kerala", dates: "Aug 25 - Sep 5", month: 8, tag: "Harvest", description: "Kerala's grand harvest festival with boat races" },
 
  // SEPTEMBER
  { name: "Ganesh Chaturthi", emoji: "🐘", destination: "Mumbai", destinationSlug: null, dates: "Sep 2-12", month: 9, tag: "Festival", description: "10-day celebration of Lord Ganesha, massive in Mumbai" },
  { name: "Janmashtami", emoji: "🪈", destination: "All India", destinationSlug: null, dates: "Sep 2", month: 9, tag: "Spiritual", description: "Birth of Lord Krishna, dahi handi in Mumbai" },
  { name: "Ladakh Harvest Fest", emoji: "🌾", destination: "Ladakh", destinationSlug: "ladakh", dates: "Sep 15-30", month: 9, tag: "Cultural", description: "Harvest celebrations in Ladakh villages" },
 
  // OCTOBER
  { name: "Navratri", emoji: "💃", destination: "Gujarat", destinationSlug: null, dates: "Oct 9-17", month: 10, tag: "Festival", description: "9 nights of Garba and Dandiya in Gujarat" },
  { name: "Dussehra", emoji: "🎭", destination: "All India", destinationSlug: null, dates: "Oct 17", month: 10, tag: "Festival", description: "Victory of good over evil, Ramlila performances" },
  { name: "Diwali", emoji: "🪔", destination: "All India", destinationSlug: null, dates: "Oct 20", month: 10, tag: "Festival", description: "Festival of Lights — fireworks, diyas, and sweets" },
  { name: "Pushkar Camel Fair", emoji: "🐪", destination: "Pushkar", destinationSlug: "pushkar", dates: "Oct 28 - Nov 5", month: 10, tag: "Cultural", description: "World's largest camel fair in Rajasthan" },
 
  // NOVEMBER
  { name: "Guru Nanak Jayanti", emoji: "🕉️", destination: "All India", destinationSlug: null, dates: "Nov 5", month: 11, tag: "Spiritual", description: "Birthday of Guru Nanak, founder of Sikhism" },
  { name: "IFFI Goa", emoji: "🎬", destination: "Goa", destinationSlug: "goa", dates: "Nov 20-28", month: 11, tag: "Film", description: "International Film Festival of India" },
  { name: "Rann Utsav Opens", emoji: "🏜️", destination: "Kutch", destinationSlug: null, dates: "Nov 1", month: 11, tag: "Cultural", description: "White desert festival season opens" },
 
  // DECEMBER
  { name: "Hornbill Festival", emoji: "🦅", destination: "Nagaland", destinationSlug: null, dates: "Dec 1-10", month: 12, tag: "Cultural", description: "Festival of Festivals — tribal heritage of Nagaland" },
  { name: "Sunburn Festival", emoji: "🎆", destination: "Goa", destinationSlug: "goa", dates: "Dec 28-30", month: 12, tag: "Music", description: "Asia's biggest electronic music festival" },
  { name: "Kochi Carnival", emoji: "🎉", destination: "Kerala", destinationSlug: "kerala", dates: "Dec 25 - Jan 1", month: 12, tag: "Carnival", description: "New Year celebrations on Fort Kochi beach" },
  { name: "Christmas", emoji: "🎄", destination: "All India", destinationSlug: null, dates: "Dec 25", month: 12, tag: "Festival", description: "Celebrated grandly in Goa, Kerala and Northeast" },
];
 
async function seed() {
  console.log("Seeding events...");
  for (const event of events) {
    await prisma.event.create({ data: event });
    console.log(`  ✓ ${event.name}`);
  }
  console.log(`Done! Seeded ${events.length} events.`);
}
 
seed().catch(console.error);