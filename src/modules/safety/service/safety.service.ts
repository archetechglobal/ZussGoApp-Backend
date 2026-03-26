import { SafetyRepository } from "../repository/safety.repository.ts";
 
export class SafetyService {
  private repo = new SafetyRepository();
 
  startTrip = async (userId: string, data: any) => { return await this.repo.startTrip(userId, data); };
  completeTrip = async (activeTripId: string, userId: string) => { return await this.repo.completeTrip(activeTripId, userId); };
  triggerSOS = async (activeTripId: string) => { return await this.repo.triggerSOS(activeTripId); };
  updateLocation = async (activeTripId: string, lat: number, lng: number) => { return await this.repo.updateLocation(activeTripId, lat, lng); };
  getActiveTrip = async (userId: string) => { return await this.repo.getActiveTrip(userId); };
  getGroupMembers = async (groupId: string) => { return await this.repo.getActiveTripsByGroup(groupId); };
  addContact = async (userId: string, name: string, phone: string, relation: string) => { return await this.repo.addContact(userId, name, phone, relation); };
  getContacts = async (userId: string) => { return await this.repo.getContacts(userId); };
  deleteContact = async (contactId: string) => { return await this.repo.deleteContact(contactId); };
}