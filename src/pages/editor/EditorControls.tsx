import React, { ReactElement } from 'react';

interface IconButtonProps {
    icon: string,
    title: string,
    onClick: () => void,
    disabled?: boolean,
    className?: string,
    compact?: boolean,
}

export const IconButton = ({ icon, title, onClick, disabled, className, compact }: IconButtonProps): ReactElement => (
    <button
        type="button"
        className={`btn btn-sm material-symbols-outlined ${compact ? 'btn-icon-compact' : ''} ${className || 'btn-outline-secondary'}`}
        title={title}
        aria-label={title}
        disabled={disabled}
        onClick={onClick}
    >
        {icon}
    </button>
);

export interface MoveRemoveControlsProps {
    orientation: 'vertical' | 'horizontal',
    canMoveBackward: boolean,
    canMoveForward: boolean,
    onMove: (offset: number) => void,
    onRemove: () => void,
    moveBackwardTitle: string,
    moveForwardTitle: string,
    removeTitle: string,
}

/**
 * Compact controls placed left of an input: Move buttons (stacked for vertical lists), followed by remove.
 */
export const MoveRemoveControls = ({
    orientation, canMoveBackward, canMoveForward, onMove, onRemove, moveBackwardTitle, moveForwardTitle, removeTitle,
}: MoveRemoveControlsProps): ReactElement => {
    const vertical = orientation === 'vertical';
    return (
        <div className="d-flex gap-1 align-items-stretch flex-shrink-0">
            <div className={`d-flex ${vertical ? 'flex-column' : ''} gap-0 btn-group-compact`}>
                <IconButton
                    compact={true}
                    icon={vertical ? 'keyboard_arrow_up' : 'chevron_left'}
                    title={moveBackwardTitle}
                    disabled={!canMoveBackward}
                    onClick={() => onMove(-1)}
                />
                <IconButton
                    compact={true}
                    icon={vertical ? 'keyboard_arrow_down' : 'chevron_right'}
                    title={moveForwardTitle}
                    disabled={!canMoveForward}
                    onClick={() => onMove(1)}
                />
            </div>
            <IconButton
                compact={true}
                icon="delete"
                title={removeTitle}
                className="btn-outline-danger"
                onClick={onRemove}
            />
        </div>
    );
};
