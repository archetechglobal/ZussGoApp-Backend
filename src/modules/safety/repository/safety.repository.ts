import { prisma } from "../../../config/prisma_client.ts";
 
export class SafetyRepository {
  startTrip = async (userId: string, data: { tripId?: string; groupId?: string; destination: string; startDate: string; endDate: string }) => {
    return await prisma.activeTrip.create({
      data: { userId, tripId: data.tripId, groupId: data.groupId, destination: data.destination, startDate: new Date(data.startDate), endDate: new Date(data.endDate), status: "ACTIVE" },
    });
  };
 
  completeTrip = async (activeTripId: string, userId: string) => {
    return await prisma.activeTrip.update({ where: { id: activeTripId }, data: { status: "COMPLETED" } });
  };
 
  triggerSOS = async (activeTripId: string) => {
    return await prisma.activeTrip.update({ where: { id: activeTripId }, data: { status: "SOS" } });
  };
 
  updateLocation = async (activeTripId: string, lat: number, lng: number) => {
    return await prisma.activeTrip.update({ where: { id: activeTripId }, data: { lastLatitude: lat, lastLongitude: lng, lastSeenAt: new Date() } });
  };
 
  getActiveTrip = async (userId: string) => {
    return await prisma.activeTrip.findFirst({ where: { userId, status: "ACTIVE" } });
  };
 
  getActiveTripsByGroup = async (groupId: string) => {
    return await prisma.activeTrip.findMany({
      where: { groupId, status: { in: ["ACTIVE", "SOS"] } },
      include: { user: { select: { id: true, fullName: true, profilePhotoUrl: true } } },
    });
  };
 
  // Emergency contacts
  addContact = async (userId: string, name: string, phone: string, relation: string) => {
    return await prisma.emergencyContact.create({ data: { userId, name, phone, relation } });
  };
 
  getContacts = async (userId: string) => {
    return await prisma.emergencyContact.findMany({ where: { userId } });
  };
 
  deleteContact = async (contactId: string) => {
    return await prisma.emergencyContact.delete({ where: { id: contactId } });
  };
}