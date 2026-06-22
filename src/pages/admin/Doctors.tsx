import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Loader2, Stethoscope, Phone, Mail, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loader from '@/components/layout/Loader';
import ErrorState from '@/components/layout/ErrorState';
import EmptyState from '@/components/layout/EmptyState';
import { formatPrice, getImageUrl } from '@/lib/utils';
import api from '@/services/api';
import type { IDoctor } from '@/types';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DoctorFormData {
  name: string;
  qualification: string;
  experience: string;
  specialization: string;
  email: string;
  phone: string;
  bio: string;
  consultationFee: string;
  isAvailable: boolean;
  profilePhoto: string;
  availableDays: string[];
}

const emptyForm: DoctorFormData = {
  name: '',
  qualification: '',
  experience: '0',
  specialization: '',
  email: '',
  phone: '',
  bio: '',
  consultationFee: '0',
  isAvailable: true,
  profilePhoto: '',
  availableDays: [],
};

export default function AdminDoctors() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorFormData>(emptyForm);

  const { data: doctors, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await api.get('/admin/doctors');
      return res.data.data as IDoctor[];
    },
  });

  const doctorList = Array.isArray(doctors) ? doctors : [];

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (doc: IDoctor) => {
    setEditId(doc._id);
    setForm({
      name: doc.name,
      qualification: doc.qualification,
      experience: String(doc.experience),
      specialization: doc.specialization,
      email: doc.email,
      phone: doc.phone,
      bio: doc.bio,
      consultationFee: String(doc.consultationFee),
      isAvailable: doc.isAvailable,
      profilePhoto: doc.profilePhoto || '',
      availableDays: doc.availableDays || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        experience: parseInt(form.experience, 10),
        consultationFee: parseFloat(form.consultationFee),
      };
      if (editId) {
        await api.put(`/admin/doctors/${editId}`, payload);
        toast.success('Doctor updated successfully');
      } else {
        await api.post('/admin/doctors', payload);
        toast.success('Doctor added successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setDialogOpen(false);
    } catch {
      toast.error(editId ? 'Failed to update doctor' : 'Failed to add doctor');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/doctors/${id}`);
    },
    onSuccess: () => {
      toast.success('Doctor deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete doctor');
    },
  });

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Doctor Management</h1>
          <p className="text-muted-foreground">Manage veterinary doctors</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Doctor
        </Button>
      </motion.div>

      {isLoading ? (
        <Loader fullScreen={false} text="Loading doctors..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : doctorList.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors registered yet"
          description="Add your veterinary staff to start accepting appointments"
          action={{ label: 'Add Doctor', onClick: openCreate }}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctorList.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getImageUrl(doc.profilePhoto)} />
                      <AvatarFallback>{doc.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.qualification}</TableCell>
                  <TableCell>{doc.experience} years</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.specialization}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(doc.consultationFee)}</TableCell>
                  <TableCell>
                    {doc.isAvailable ? (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" /> Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" /> Unavailable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(doc._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Update doctor information' : 'Register a new doctor'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Input
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification</label>
                <Input
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience (years)</label>
                <Input
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Consultation Fee ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.consultationFee}
                  onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Photo URL</label>
                <Input
                  value={form.profilePhoto}
                  onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2 flex items-center gap-2">
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
                />
                <label className="text-sm font-medium">Available for appointments</label>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={form.availableDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editId ? 'Update Doctor' : 'Add Doctor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor? This will also remove their appointments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
