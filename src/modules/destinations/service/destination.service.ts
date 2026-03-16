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

  getBySlug = async (slug: string) => {
    const destination = await this.repository.findBySlug(slug);
    if (!destination) throw new Error("Destination not found");

    return {
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      emoji: destination.emoji,
      description: destination.description,
      state: destination.state,
      country: destination.country,
      travelerCount: destination._count.trips,
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
      { name: "Goa", slug: "goa", emoji: "🏖️", description: "Beaches, sunsets & good vibes", state: "Goa", country: "India" },
      { name: "Manali", slug: "manali", emoji: "🏔️", description: "Snow peaks, adventure & chai", state: "Himachal Pradesh", country: "India" },
      { name: "Ladakh", slug: "ladakh", emoji: "🏍️", description: "Bike rides, monasteries & moonscapes", state: "Ladakh", country: "India" },
      { name: "Rishikesh", slug: "rishikesh", emoji: "🧘", description: "Rafting, yoga & spiritual vibes", state: "Uttarakhand", country: "India" },
      { name: "Jaipur", slug: "jaipur", emoji: "🏰", description: "Forts, culture & royal heritage", state: "Rajasthan", country: "India" },
      { name: "Varanasi", slug: "varanasi", emoji: "🪔", description: "Ghats, temples & ancient soul", state: "Uttar Pradesh", country: "India" },
      { name: "Hampi", slug: "hampi", emoji: "🛕", description: "Ruins, boulders & backpacker paradise", state: "Karnataka", country: "India" },
      { name: "Meghalaya", slug: "meghalaya", emoji: "🌊", description: "Living root bridges & crystal rivers", state: "Meghalaya", country: "India" },
      { name: "Kerala", slug: "kerala", emoji: "🌴", description: "Backwaters, houseboats & spice gardens", state: "Kerala", country: "India" },
      { name: "Kasol", slug: "kasol", emoji: "🌲", description: "Mountain trails & Israeli cafes", state: "Himachal Pradesh", country: "India" },
      { name: "Udaipur", slug: "udaipur", emoji: "🏛️", description: "Lakes, palaces & romantic sunsets", state: "Rajasthan", country: "India" },
      { name: "Spiti Valley", slug: "spiti-valley", emoji: "🗻", description: "Barren beauty & starry skies", state: "Himachal Pradesh", country: "India" },
      { name: "Coorg", slug: "coorg", emoji: "☕", description: "Coffee plantations & misty hills", state: "Karnataka", country: "India" },
      { name: "Andaman", slug: "andaman", emoji: "🐚", description: "Turquoise waters & coral reefs", state: "Andaman & Nicobar", country: "India" },
      { name: "Pushkar", slug: "pushkar", emoji: "🐪", description: "Desert vibes & sacred lake", state: "Rajasthan", country: "India" },
      { name: "Dharamshala", slug: "dharamshala", emoji: "🏔️", description: "Tibetan culture & mountain views", state: "Himachal Pradesh", country: "India" },
      { name: "Pondicherry", slug: "pondicherry", emoji: "🇫🇷", description: "French quarters & seaside cafes", state: "Puducherry", country: "India" },
      { name: "Munnar", slug: "munnar", emoji: "🍃", description: "Tea gardens & rolling green hills", state: "Kerala", country: "India" },
      { name: "Leh", slug: "leh", emoji: "🏔️", description: "High altitude passes & Pangong Lake", state: "Ladakh", country: "India" },
      { name: "Gokarna", slug: "gokarna", emoji: "🏖️", description: "Hidden beaches & hippie trails", state: "Karnataka", country: "India" },
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