import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, delay, map } from 'rxjs';
import { Tender, TenderStatus, CreateTenderDto } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private tendersSubject = new BehaviorSubject<Tender[]>([]);
  public tenders$ = this.tendersSubject.asObservable();

  private storageKey = 'tenders_data';

  constructor(private authService: AuthService) {
    this.loadTenders();
    this.checkDeadlines();
  }

  private loadTenders(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const tenders = JSON.parse(stored);
      // Convert date strings back to Date objects
      tenders.forEach((t: any) => {
        t.deadline = new Date(t.deadline);
        t.createdAt = new Date(t.createdAt);
        t.updatedAt = new Date(t.updatedAt);
        if (t.publishDate) t.publishDate = new Date(t.publishDate);
      });
      this.tendersSubject.next(tenders);
    } else {
      this.initializeMockData();
    }
  }

  private saveTenders(tenders: Tender[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tenders));
    this.tendersSubject.next(tenders);
  }

  private initializeMockData(): void {
    const mockTenders: Tender[] = [
      {
        id: '1',
        title: 'Construction du pont autoroutier A25',
        description: 'Appel d\'offres pour la construction d\'un pont autoroutier de 500m avec voies piétonnes et cyclables.',
        budget: 5000000,
        currency: 'EUR',
        status: TenderStatus.OPEN,
        ownerId: '2',
        ownerName: 'Ministère des Infrastructures',
        publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        criteria: [
          { id: 'c1', name: 'Prix', weight: 40, description: 'Offre financière' },
          { id: 'c2', name: 'Qualité technique', weight: 35, description: 'Expertise et méthodologie' },
          { id: 'c3', name: 'Délais', weight: 25, description: 'Respect du planning' }
        ],
        documentIds: ['doc1', 'doc2'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Fourniture de matériel informatique',
        description: 'Acquisition de 500 ordinateurs portables et 50 serveurs pour l\'administration.',
        budget: 750000,
        currency: 'EUR',
        status: TenderStatus.OPEN,
        ownerId: '2',
        ownerName: 'Ministère des Infrastructures',
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        criteria: [
          { id: 'c1', name: 'Prix', weight: 50, description: 'Meilleur rapport qualité/prix' },
          { id: 'c2', name: 'Garantie', weight: 30, description: 'Durée et étendue de la garantie' },
          { id: 'c3', name: 'Support technique', weight: 20, description: 'Disponibilité du support' }
        ],
        documentIds: ['doc3'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Rénovation énergétique des bâtiments publics',
        description: 'Travaux d\'isolation et installation de panneaux solaires sur 10 bâtiments administratifs.',
        budget: 2500000,
        currency: 'EUR',
        status: TenderStatus.CLOSED,
        ownerId: '2',
        ownerName: 'Ministère des Infrastructures',
        publishDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        criteria: [
          { id: 'c1', name: 'Prix', weight: 35, description: 'Coût total du projet' },
          { id: 'c2', name: 'Performance énergétique', weight: 40, description: 'Économies d\'énergie prévues' },
          { id: 'c3', name: 'Expérience', weight: 25, description: 'Références similaires' }
        ],
        documentIds: ['doc4', 'doc5'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    this.saveTenders(mockTenders);
  }

  // Check deadlines and auto-close tenders
  private checkDeadlines(): void {
    setInterval(() => {
      const tenders = this.tendersSubject.value;
      const now = new Date();
      let updated = false;

      tenders.forEach(tender => {
        if (tender.status === TenderStatus.OPEN && tender.deadline < now) {
          tender.status = TenderStatus.CLOSED;
          tender.updatedAt = now;
          updated = true;
        }
      });

      if (updated) {
        this.saveTenders(tenders);
      }
    }, 60000); // Check every minute
  }

  // Get all tenders
  getAllTenders(): Observable<Tender[]> {
    return of(this.tendersSubject.value).pipe(delay(300));
  }

  // Get tenders by owner
  getTendersByOwner(ownerId: string): Observable<Tender[]> {
    return of(this.tendersSubject.value.filter(t => t.ownerId === ownerId)).pipe(delay(300));
  }

  // Get open tenders (for suppliers)
  getOpenTenders(): Observable<Tender[]> {
    return of(this.tendersSubject.value.filter(t => t.status === TenderStatus.OPEN)).pipe(delay(300));
  }

  // Get tender by ID
  getTenderById(id: string): Observable<Tender> {
    const tender = this.tendersSubject.value.find(t => t.id === id);
    if (!tender) {
      return throwError(() => new Error('Appel d\'offre non trouvé')).pipe(delay(300));
    }
    return of(tender).pipe(delay(300));
  }

  // Create tender
  createTender(dto: CreateTenderDto): Observable<Tender> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    const tenders = this.tendersSubject.value;
    const newTender: Tender = {
      id: `tender_${Date.now()}`,
      title: dto.title,
      description: dto.description,
      budget: dto.budget,
      currency: dto.currency,
      status: TenderStatus.DRAFT,
      ownerId: user.id,
      ownerName: user.organizationName || `${user.firstName} ${user.lastName}`,
      deadline: dto.deadline,
      criteria: dto.criteria.map((c, index) => ({
        id: `criteria_${Date.now()}_${index}`,
        name: c.name,
        weight: c.weight,
        description: c.description
      })),
      documentIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveTenders([...tenders, newTender]);
    return of(newTender).pipe(delay(500));
  }

  // Update tender
  updateTender(id: string, updates: Partial<Tender>): Observable<Tender> {
    const tenders = this.tendersSubject.value;
    const index = tenders.findIndex(t => t.id === id);

    if (index === -1) {
      return throwError(() => new Error('Appel d\'offre non trouvé'));
    }

    const updatedTender = {
      ...tenders[index],
      ...updates,
      updatedAt: new Date()
    };

    tenders[index] = updatedTender;
    this.saveTenders(tenders);

    return of(updatedTender).pipe(delay(500));
  }

  // Publish tender
  publishTender(id: string): Observable<Tender> {
    return this.updateTender(id, {
      status: TenderStatus.OPEN,
      publishDate: new Date()
    });
  }

  // Close tender
  closeTender(id: string): Observable<Tender> {
    return this.updateTender(id, {
      status: TenderStatus.CLOSED
    });
  }

  // Award tender
  awardTender(id: string): Observable<Tender> {
    return this.updateTender(id, {
      status: TenderStatus.AWARDED
    });
  }

  // Delete tender
  deleteTender(id: string): Observable<void> {
    const tenders = this.tendersSubject.value.filter(t => t.id !== id);
    this.saveTenders(tenders);
    return of(void 0).pipe(delay(300));
  }

  // Get tenders by status
  getTendersByStatus(status: TenderStatus): Observable<Tender[]> {
    return of(this.tendersSubject.value.filter(t => t.status === status)).pipe(delay(300));
  }

  // Get tender statistics
  getStatistics(): Observable<{
    total: number;
    draft: number;
    open: number;
    closed: number;
    awarded: number;
  }> {
    const tenders = this.tendersSubject.value;
    return of({
      total: tenders.length,
      draft: tenders.filter(t => t.status === TenderStatus.DRAFT).length,
      open: tenders.filter(t => t.status === TenderStatus.OPEN).length,
      closed: tenders.filter(t => t.status === TenderStatus.CLOSED).length,
      awarded: tenders.filter(t => t.status === TenderStatus.AWARDED).length
    }).pipe(delay(300));
  }
}
