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
    Switch,
} from '@mui/material';
import { IMaintenanceEvent } from '../../interfaces/maintenance.interface.tsx';

interface MaintenanceFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (maintenanceEvent: IMaintenanceEvent, update?: boolean) => void;
    maintenanceEvent?: IMaintenanceEvent; // For editing, undefined for new
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ open, onClose, onSave, maintenanceEvent }) => {
    const [editedEvent, setEditedEvent] = useState<IMaintenanceEvent>({
        name: '',
        startTime: '',
        endTime: '',
        hostname: '',
        probe: '',
        source: '',
        message: '',
        isActive: true,
    });

    // Load existing maintenance event data for editing
    useEffect(() => {
        if (maintenanceEvent) {
            setEditedEvent(maintenanceEvent);
        } else {
            setEditedEvent({
                name: '',
                startTime: '',
                endTime: '',
                hostname: '',
                probe: '',
                source: '',
                message: '',
                isActive: true,
            });
        }
    }, [maintenanceEvent]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditedEvent((prevEvent) => ({
            ...prevEvent,
            [name]: value,
        }));
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedEvent((prevEvent) => ({
            ...prevEvent,
            isActive: event.target.checked,
        }));
    };

    const handleSave = () => {
        if (maintenanceEvent) {
            onSave(editedEvent, true); // Updating existing event
        } else {
            onSave(editedEvent); // Creating a new event
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="maintenance-form-dialog-title">
            <DialogTitle id="maintenance-form-dialog-title">
                {maintenanceEvent ? 'Edit Maintenance Event' : 'Add Maintenance Event'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Fill in the details for the maintenance event.
                </DialogContentText>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Event Name"
                    fullWidth
                    name="name"
                    value={editedEvent.name}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Start Time"
                    type="datetime-local"
                    fullWidth
                    name="startTime"
                    value={editedEvent.startTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    margin="dense"
                    label="End Time"
                    type="datetime-local"
                    fullWidth
                    name="endTime"
                    value={editedEvent.endTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    margin="dense"
                    label="Hostname"
                    fullWidth
                    name="hostname"
                    value={editedEvent.hostname}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Probe"
                    fullWidth
                    name="probe"
                    value={editedEvent.probe}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Source"
                    fullWidth
                    name="source"
                    value={editedEvent.source}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    label="Message"
                    fullWidth
                    multiline
                    rows={3}
                    name="message"
                    value={editedEvent.message}
                    onChange={handleInputChange}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={editedEvent.isActive}
                            onChange={handleSwitchChange}
                            name="isActive"
                        />
                    }
                    label="Active"
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

export default MaintenanceForm;
