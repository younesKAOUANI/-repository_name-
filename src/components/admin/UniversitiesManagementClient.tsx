'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  University, 
  Link, 
  ExternalLink,
  Loader2,
  Edit
} from 'lucide-react';

interface University {
  id: string;
  name: string;
  driveLinks: DriveLink[];
  _count: {
    driveLinks: number;
  };
}

interface DriveLink {
  id: string;
  year: string;
  studyYear: string;
  link: string;
  universityId: string;
  university?: University;
}

interface CreateUniversityForm {
  name: string;
}

interface CreateDriveLinkForm {
  year: string;
  studyYear: string;
  link: string;
  universityId: string;
}

export default function UniversitiesManagementClient() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [driveLinks, setDriveLinks] = useState<DriveLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('universities');
  const [error, setError] = useState<string>('');

  // University filters and search
  const [universityFilters, setUniversityFilters] = useState({
    search: '',
  });

  // Drive link filters
  const [driveLinkFilters, setDriveLinkFilters] = useState({
    search: '',
    universityId: 'all',
  });

  // Modal states
  const [createUniversityOpen, setCreateUniversityOpen] = useState(false);
  const [createDriveLinkOpen, setCreateDriveLinkOpen] = useState(false);
  const [editUniversityOpen, setEditUniversityOpen] = useState(false);
  const [editDriveLinkOpen, setEditDriveLinkOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [createUniversityForm, setCreateUniversityForm] = useState<CreateUniversityForm>({
    name: '',
  });
  const [createDriveLinkForm, setCreateDriveLinkForm] = useState<CreateDriveLinkForm>({
    year: '',
    studyYear: '',
    link: '',
    universityId: '',
  });

  // Edit and delete states
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [editingDriveLink, setEditingDriveLink] = useState<DriveLink | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'university' | 'drivelink'; id: string; name: string } | null>(null);

  // Load universities
  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities');
      if (!response.ok) throw new Error('Failed to load universities');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast.error('Failed to load universities');
    }
  };

  // Load drive links
  const loadDriveLinks = async (universityId?: string) => {
    try {
      const url = universityId && universityId !== 'all' 
        ? `/api/admin/drive-links?universityId=${universityId}`
        : '/api/admin/drive-links';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load drive links');
      const data = await response.json();
      setDriveLinks(data);
    } catch (error) {
      console.error('Error loading drive links:', error);
      toast.error('Failed to load drive links');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadUniversities(),
        loadDriveLinks()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Filter drive links when university selection changes
  useEffect(() => {
    loadDriveLinks(driveLinkFilters.universityId);
  }, [driveLinkFilters.universityId]);

  // Create university
  const handleCreateUniversity = async () => {
    if (!createUniversityForm.name.trim()) {
      toast.error('University name is required');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createUniversityForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create university');
      }

      toast.success('University created successfully');
      setCreateUniversityForm({ name: '' });
      setCreateUniversityOpen(false);
      await loadUniversities();
    } catch (error) {
      console.error('Error creating university:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create university');
    } finally {
      setActionLoading(false);
    }
  };

  // Create drive link
  const handleCreateDriveLink = async () => {
    const { year, studyYear, link, universityId } = createDriveLinkForm;

    if (!year.trim() || !studyYear.trim() || !link.trim() || !universityId) {
      toast.error('All fields are required');
      return;
    }

    // Validate year format
    if (!/^\d{4}\/\d{4}$/.test(year)) {
      toast.error('Year must be in format YYYY/YYYY (e.g., 2024/2025)');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/drive-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, studyYear, link, universityId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create drive link');
      }

      toast.success('Drive link created successfully');
      setCreateDriveLinkForm({ year: '', studyYear: '', link: '', universityId: '' });
      setCreateDriveLinkOpen(false);
      await Promise.all([loadUniversities(), loadDriveLinks(driveLinkFilters.universityId)]);
    } catch (error) {
      console.error('Error creating drive link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create drive link');
    } finally {
      setActionLoading(false);
    }
  };

  // Update university
  const handleUpdateUniversity = async () => {
    if (!editingUniversity || !editingUniversity.name.trim()) {
      toast.error('University name is required');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/universities/${editingUniversity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingUniversity.name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update university');
      }

      toast.success('University updated successfully');
      setEditUniversityOpen(false);
      setEditingUniversity(null);
      await loadUniversities();
    } catch (error) {
      console.error('Error updating university:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update university');
    } finally {
      setActionLoading(false);
    }
  };

  // Update drive link
  const handleUpdateDriveLink = async () => {
    if (!editingDriveLink) return;

    const { year, studyYear, link, universityId } = editingDriveLink;

    if (!year.trim() || !studyYear.trim() || !link.trim() || !universityId) {
      toast.error('All fields are required');
      return;
    }

    // Validate year format
    if (!/^\d{4}\/\d{4}$/.test(year)) {
      toast.error('Year must be in format YYYY/YYYY (e.g., 2024/2025)');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/drive-links/${editingDriveLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, studyYear, link, universityId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update drive link');
      }

      toast.success('Drive link updated successfully');
      setEditDriveLinkOpen(false);
      setEditingDriveLink(null);
      await Promise.all([loadUniversities(), loadDriveLinks(driveLinkFilters.universityId)]);
    } catch (error) {
      console.error('Error updating drive link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update drive link');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!deletingItem) return;

    setActionLoading(true);
    try {
      const endpoint = deletingItem.type === 'university' 
        ? `/api/admin/universities/${deletingItem.id}`
        : `/api/admin/drive-links/${deletingItem.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }

      toast.success(`${deletingItem.type === 'university' ? 'University' : 'Drive link'} deleted successfully`);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      
      if (deletingItem.type === 'university') {
        await loadUniversities();
        // Reset filter if deleted university was selected
        if (driveLinkFilters.universityId === deletingItem.id) {
          setDriveLinkFilters({ ...driveLinkFilters, universityId: 'all' });
        }
      }
      await loadDriveLinks(driveLinkFilters.universityId);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter universities based on search
  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(universityFilters.search.toLowerCase())
  );

  // Filter drive links based on search and university
  const filteredDriveLinks = driveLinks.filter(link => {
    const matchesSearch = link.year.includes(driveLinkFilters.search) || 
                         link.link.toLowerCase().includes(driveLinkFilters.search.toLowerCase());
    const matchesUniversity = driveLinkFilters.universityId === 'all' || 
                             link.universityId === driveLinkFilters.universityId;
    return matchesSearch && matchesUniversity;
  });

  // Table columns for universities
  const universityColumns: TableColumn<University>[] = [
    {
      key: 'name',
      label: 'Nom de l\'université',
      sortable: true,
    },
    {
      key: 'driveLinksCount',
      label: 'Nombre de liens',
      render: (value, university) => (
        <Badge variant="secondary">
          {university._count.driveLinks}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value, university) => new Date().toLocaleDateString('fr-FR'),
    },
  ];

  // Table columns for drive links
  const driveLinkColumns: TableColumn<DriveLink>[] = [
    {
      key: 'university',
      label: 'Université',
      render: (value, driveLink) => {
        const university = universities.find(u => u.id === driveLink.universityId);
        return <span className="font-medium">{university?.name}</span>;
      },
    },
    {
      key: 'studyYear',
      label: 'Année d\'études',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      key: 'year',
      label: 'Année académique',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'link',
      label: 'Lien Google Drive',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 truncate max-w-[200px]">{value}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(value, '_blank')}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Table actions for universities
  const universityActions: TableAction<University>[] = [
    {
      label: 'Modifier',
      icon: <Edit className="h-4 w-4" />,
      onClick: (university) => {
        setEditingUniversity({ ...university });
        setEditUniversityOpen(true);
      },
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (university) => {
        setDeletingItem({ type: 'university', id: university.id, name: university.name });
        setDeleteDialogOpen(true);
      },
      variant: 'danger',
    },
  ];

  // Table actions for drive links
  const driveLinkActions: TableAction<DriveLink>[] = [
    {
      label: 'Modifier',
      icon: <Edit className="h-4 w-4" />,
      onClick: (driveLink) => {
        setEditingDriveLink({ ...driveLink });
        setEditDriveLinkOpen(true);
      },
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (driveLink) => {
        const university = universities.find(u => u.id === driveLink.universityId);
        setDeletingItem({ 
          type: 'drivelink', 
          id: driveLink.id, 
          name: `${university?.name} - ${driveLink.year}` 
        });
        setDeleteDialogOpen(true);
      },
      variant: 'danger',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des universités</h1>
          <p className="text-gray-600">Gérez les universités et leurs liens de cours</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="universities" className="flex items-center space-x-2">
            <University className="h-4 w-4" />
            <span>Universités</span>
          </TabsTrigger>
          <TabsTrigger value="drivelinks" className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>Liens de cours</span>
          </TabsTrigger>
        </TabsList>

        {/* Universities Tab */}
        <TabsContent value="universities" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Rechercher une université..."
                value={universityFilters.search}
                onChange={(e) => setUniversityFilters({ ...universityFilters, search: e.target.value })}
                className="w-64"
              />
            </div>
            <Button onClick={() => setCreateUniversityOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvelle université</span>
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <DataTable
              data={filteredUniversities}
              columns={universityColumns}
              actions={universityActions}
              loading={loading}
              emptyMessage="Aucune université trouvée"
            />
          </div>
        </TabsContent>

        {/* Drive Links Tab */}
        <TabsContent value="drivelinks" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Rechercher un lien..."
                value={driveLinkFilters.search}
                onChange={(e) => setDriveLinkFilters({ ...driveLinkFilters, search: e.target.value })}
                className="w-64"
              />
              <Select
                value={driveLinkFilters.universityId}
                onValueChange={(value) => setDriveLinkFilters({ ...driveLinkFilters, universityId: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les universités</SelectItem>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setCreateDriveLinkOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau lien de cours</span>
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <DataTable
              data={filteredDriveLinks}
              columns={driveLinkColumns}
              actions={driveLinkActions}
              loading={loading}
              emptyMessage="Aucun lien de cours trouvé"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Create University Modal */}
      <Dialog open={createUniversityOpen} onOpenChange={setCreateUniversityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle université</DialogTitle>
            <DialogDescription>
              Créez une nouvelle université pour organiser les cours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="university-name">Nom de l'université</Label>
              <Input
                id="university-name"
                placeholder="ex: Université de Médecine"
                value={createUniversityForm.name}
                onChange={(e) => setCreateUniversityForm({ name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setCreateUniversityOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateUniversity}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer l'université
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Drive Link Modal */}
      <Dialog open={createDriveLinkOpen} onOpenChange={setCreateDriveLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau lien de cours</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lien Google Drive pour une université.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="drivelink-university">Université</Label>
              <Select
                value={createDriveLinkForm.universityId}
                onValueChange={(value: string) => 
                  setCreateDriveLinkForm({ ...createDriveLinkForm, universityId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une université" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="drivelink-study-year">Année d'études</Label>
              <Select
                value={createDriveLinkForm.studyYear}
                onValueChange={(value) => setCreateDriveLinkForm({ ...createDriveLinkForm, studyYear: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année d'études" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ère année">1ère année</SelectItem>
                  <SelectItem value="2ème année">2ème année</SelectItem>
                  <SelectItem value="3ème année">3ème année</SelectItem>
                  <SelectItem value="4ème année">4ème année</SelectItem>
                  <SelectItem value="5ème année">5ème année</SelectItem>
                  <SelectItem value="6ème année">6ème année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="drivelink-year">Année académique</Label>
              <Input
                id="drivelink-year"
                placeholder="ex: 2024/2025"
                value={createDriveLinkForm.year}
                onChange={(e) => setCreateDriveLinkForm({ ...createDriveLinkForm, year: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Format: YYYY/YYYY</p>
            </div>
            <div>
              <Label htmlFor="drivelink-url">Lien Google Drive</Label>
              <Input
                id="drivelink-url"
                placeholder="https://drive.google.com/..."
                value={createDriveLinkForm.link}
                onChange={(e) => setCreateDriveLinkForm({ ...createDriveLinkForm, link: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setCreateDriveLinkOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateDriveLink}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit University Modal */}
      <Dialog open={editUniversityOpen} onOpenChange={setEditUniversityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'université</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'université.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-university-name">Nom de l'université</Label>
              <Input
                id="edit-university-name"
                value={editingUniversity?.name || ''}
                onChange={(e) => 
                  setEditingUniversity(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEditUniversityOpen(false);
                setEditingUniversity(null);
              }}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateUniversity}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Modifier l'université
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Drive Link Modal */}
      <Dialog open={editDriveLinkOpen} onOpenChange={setEditDriveLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le lien de cours</DialogTitle>
            <DialogDescription>
              Modifiez les informations du lien de cours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-link-university">Université</Label>
              <Select
                value={editingDriveLink?.universityId || ''}
                onValueChange={(value: string) => 
                  setEditingDriveLink(prev => 
                    prev ? { ...prev, universityId: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-link-study-year">Année d'études</Label>
              <Select
                value={editingDriveLink?.studyYear || ''}
                onValueChange={(value: string) => 
                  setEditingDriveLink(prev => 
                    prev ? { ...prev, studyYear: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ère année">1ère année</SelectItem>
                  <SelectItem value="2ème année">2ème année</SelectItem>
                  <SelectItem value="3ème année">3ème année</SelectItem>
                  <SelectItem value="4ème année">4ème année</SelectItem>
                  <SelectItem value="5ème année">5ème année</SelectItem>
                  <SelectItem value="6ème année">6ème année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-link-year">Année académique</Label>
              <Input
                id="edit-link-year"
                placeholder="ex: 2024/2025"
                value={editingDriveLink?.year || ''}
                onChange={(e) => 
                  setEditingDriveLink(prev => 
                    prev ? { ...prev, year: e.target.value } : null
                  )
                }
              />
              <p className="text-xs text-gray-500 mt-1">Format: YYYY/YYYY</p>
            </div>
            <div>
              <Label htmlFor="edit-link-url">Lien Google Drive</Label>
              <Input
                id="edit-link-url"
                value={editingDriveLink?.link || ''}
                onChange={(e) => 
                  setEditingDriveLink(prev => 
                    prev ? { ...prev, link: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEditDriveLinkOpen(false);
                setEditingDriveLink(null);
              }}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateDriveLink}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Modifier le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{deletingItem?.name}&quot; ?
              {deletingItem?.type === 'university' && 
                ' Tous les liens de cours associés seront également supprimés.'
              }
              {' '}Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
              }}
              disabled={actionLoading}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
