import { DestinationRepository } from "../repository/destination.repository.ts";
import type { CreateDestinationInput } from "../schemas/destination.schema.ts";

export class DestinationService {
  private repository = new DestinationRepository();

  getAll = async () => {
    const destinations = await this.repository.findAll();
    return destinations.map((d:any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      emoji: d.emoji,
      description: d.description,
      state: d.state,
      country: d.country,
      imageUrl: d.imageUrl,
      travelerCount: d._count.trips,
    }));
  };

  getBySlug = async (slug: string, excludeUserId?: string) => {
    const destination = await this.repository.findBySlug(slug, excludeUserId);
    if (!destination) throw new Error("Destination not found");

    // Add mock rating implementation matching the mockup.
    // In a future update, we can compute an actual average from related ratings.
    const mockRating = destination.slug === "goa" ? "4.8" : "4.5";

    return {
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      emoji: destination.emoji,
      description: destination.description,
      state: destination.state,
      country: destination.country,
      imageUrl: destination.imageUrl,
      travelerCount: destination._count.trips,
      rating: mockRating,
      travelers: destination.trips.map((t:any) => ({
        tripId: t.id,
        startDate: t.startDate,
        endDate: t.endDate,
        budget: t.budget,
        user: t.user,
      })),
    };
  };

  create = async (input: CreateDestinationInput) => {
    return await this.repository.create(input);
  };

  seed = async () => {
    const destinations: CreateDestinationInput[] = [
      { name: "Goa", slug: "goa", emoji: "🏖️", description: "Beaches, sunsets & good vibes", state: "Goa", country: "India", imageUrl: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=600&auto=format&fit=crop" },
      { name: "Manali", slug: "manali", emoji: "🏔️", description: "Snow peaks, adventure & chai", state: "Himachal Pradesh", country: "India", imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop" },
      { name: "Ladakh", slug: "ladakh", emoji: "🏍️", description: "Bike rides, monasteries & moonscapes", state: "Ladakh", country: "India", imageUrl: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&auto=format&fit=crop" },
      { name: "Rishikesh", slug: "rishikesh", emoji: "🧘", description: "Rafting, yoga & spiritual vibes", state: "Uttarakhand", country: "India", imageUrl: "https://images.unsplash.com/photo-1651513614940-8ade2d9aaab6?w=600&auto=format&fit=crop" },
      { name: "Jaipur", slug: "jaipur", emoji: "🏰", description: "Forts, culture & royal heritage", state: "Rajasthan", country: "India", imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop" },
      { name: "Varanasi", slug: "varanasi", emoji: "🪔", description: "Ghats, temples & ancient soul", state: "Uttar Pradesh", country: "India", imageUrl: "https://images.unsplash.com/photo-1561361058-c24e01d80dc7?w=600&auto=format&fit=crop" },
      { name: "Hampi", slug: "hampi", emoji: "🛕", description: "Ruins, boulders & backpacker paradise", state: "Karnataka", country: "India", imageUrl: "https://images.unsplash.com/photo-1600689186914-c5c5e9f47614?w=600&auto=format&fit=crop" },
      { name: "Meghalaya", slug: "meghalaya", emoji: "🌊", description: "Living root bridges & crystal rivers", state: "Meghalaya", country: "India", imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop" },
      { name: "Kerala", slug: "kerala", emoji: "🌴", description: "Backwaters, houseboats & spice gardens", state: "Kerala", country: "India", imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop" },
      { name: "Kasol", slug: "kasol", emoji: "🌲", description: "Mountain trails & Israeli cafes", state: "Himachal Pradesh", country: "India", imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop" },
      { name: "Udaipur", slug: "udaipur", emoji: "🏛️", description: "Lakes, palaces & romantic sunsets", state: "Rajasthan", country: "India", imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop" },
      { name: "Spiti Valley", slug: "spiti-valley", emoji: "🗻", description: "Barren beauty & starry skies", state: "Himachal Pradesh", country: "India", imageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&auto=format&fit=crop" },
      { name: "Coorg", slug: "coorg", emoji: "☕", description: "Coffee plantations & misty hills", state: "Karnataka", country: "India", imageUrl: "https://images.unsplash.com/photo-1585016495481-91f74f6e5a89?w=600&auto=format&fit=crop" },
      { name: "Andaman", slug: "andaman", emoji: "🐚", description: "Turquoise waters & coral reefs", state: "Andaman & Nicobar", country: "India", imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&auto=format&fit=crop" },
      { name: "Pushkar", slug: "pushkar", emoji: "🐪", description: "Desert vibes & sacred lake", state: "Rajasthan", country: "India", imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop" },
      { name: "Dharamshala", slug: "dharamshala", emoji: "🏔️", description: "Tibetan culture & mountain views", state: "Himachal Pradesh", country: "India", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop" },
      { name: "Pondicherry", slug: "pondicherry", emoji: "🇫🇷", description: "French quarters & seaside cafes", state: "Puducherry", country: "India", imageUrl: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=600&auto=format&fit=crop" },
      { name: "Munnar", slug: "munnar", emoji: "🍃", description: "Tea gardens & rolling green hills", state: "Kerala", country: "India", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop" },
      { name: "Leh", slug: "leh", emoji: "🏔️", description: "High altitude passes & Pangong Lake", state: "Ladakh", country: "India", imageUrl: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&auto=format&fit=crop" },
      { name: "Gokarna", slug: "gokarna", emoji: "🏖️", description: "Hidden beaches & hippie trails", state: "Karnataka", country: "India", imageUrl: "https://images.unsplash.com/photo-1590123715937-ae7e9c0ef9a1?w=600&auto=format&fit=crop" },
    ];

    const result = await this.repository.createMany(destinations);
    return { message: `Seeded ${result.count} destinations` };
  };

  search = async (query: string) => {
    const results = await this.repository.search(query);
    return results.map((d:any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      emoji: d.emoji,
      state: d.state,
      travelerCount: d._count.trips,
    }));
  };
}