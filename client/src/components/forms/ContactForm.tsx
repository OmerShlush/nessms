import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Divider
} from '@mui/material';
import { IContact } from '../../interfaces/contact.interface';

interface ContactFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (contact: IContact, update?: boolean) => void;
    contact?: IContact; // Pass existing contact for editing, undefined for adding
}

const ContactForm: React.FC<ContactFormProps> = ({ open, onClose, onSave, contact }) => {
    const [editedContact, setEditedContact] = useState<IContact>({
        name: '',
        phone: '',
        email: '',
        groups: [],
        active: { sms: false, email: false },
        schedule: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            start_time: '00:00',
            end_time: '24:00',
        },
    });

    useEffect(() => {
        if (contact) {
            setEditedContact(contact);
        } else {
            setEditedContact({
                name: '',
                phone: '',
                email: '',
                groups: [],
                active: { sms: false, email: false },
                schedule: {
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true,
                    start_time: '00:00',
                    end_time: '24:00',
                },
            });
        }
    }, [contact]);


    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
    
        if (name === 'groups') {
            setEditedContact((prevContact) => ({
                ...prevContact,
                [name]: value.split(',').map(group => group.trimStart()),
            }));
        } else if (name === 'start_time' || name === 'end_time') {
            setEditedContact((prevContact) => ({
                ...prevContact,
                schedule: {
                    ...prevContact.schedule,
                    [name]: value,
                },
            }));
        } else {
            setEditedContact((prevContact) => ({
                ...prevContact,
                [name]: value,
            }));
        }
    };
    


    const handleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, checked } = event.target;
        setEditedContact((prevContact) => ({
            ...prevContact,
            active: {
                ...prevContact.active,
                [name]: checked,
            },
        }));
    };

    const handleScheduleCheckboxChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, checked } = event.target;
        setEditedContact((prevContact) => ({
            ...prevContact,
            schedule: {
                ...prevContact.schedule,
                [name]: checked,
            },
        }));
    };

    const handleSave = () => {
        if (contact) {
            onSave(editedContact, true); // Editing an existing policy group
        } else {
            onSave(editedContact);
        }
        onClose();
    };


    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="contact-form-dialog-title">
            <DialogTitle id="contact-form-dialog-title">
                {contact ? 'Edit Contact' : 'Add Contact'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the contact details below.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    fullWidth
                    name="name"
                    value={editedContact.name}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Phone"
                    fullWidth
                    name="phone"
                    value={editedContact.phone}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Email"
                    fullWidth
                    name="email"
                    value={editedContact.email}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Groups"
                    fullWidth
                    name="groups"
                    value={editedContact.groups.join(',')}
                    onChange={handleInputChange}
                />

                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.active.sms}
                                onChange={handleCheckboxChange}
                                name="sms"
                            />
                        }
                        label="Active SMS"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.active.email}
                                onChange={handleCheckboxChange}
                                name="email"
                            />
                        }
                        label="Active Email"
                    />
                </FormGroup>
                <Divider />
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.sunday}
                                onChange={handleScheduleCheckboxChange}
                                name="sunday"
                            />
                        }
                        label="Sunday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.monday}
                                onChange={handleScheduleCheckboxChange}
                                name="monday"
                            />
                        }
                        label="Monday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.tuesday}
                                onChange={handleScheduleCheckboxChange}
                                name="tuesday"
                            />
                        }
                        label="Tuesday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.wednesday}
                                onChange={handleScheduleCheckboxChange}
                                name="wednesday"
                            />
                        }
                        label="Wednesday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.thursday}
                                onChange={handleScheduleCheckboxChange}
                                name="thursday"
                            />
                        }
                        label="Thursday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.friday}
                                onChange={handleScheduleCheckboxChange}
                                name="friday"
                            />
                        }
                        label="Friday"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={editedContact.schedule.saturday}
                                onChange={handleScheduleCheckboxChange}
                                name="saturday"
                            />
                        }
                        label="Saturday"
                    />

                </FormGroup>
                <TextField
                    margin="dense"
                    label="Start Time (HH:MM)"
                    fullWidth
                    name="start_time"
                    value={editedContact.schedule.start_time}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="End Time (HH:MM)"
                    fullWidth
                    name="end_time"
                    value={editedContact.schedule.end_time}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContactForm;
