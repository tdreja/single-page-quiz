import { SidebarSectionProps } from '../Sidebar';
import { RoundProps } from '../RoundProps';
import React, { ReactElement, useContext } from 'react';
import { I18N } from '../../../../i18n/I18N';
import { TeamColorButton } from '../../../../components/common/TeamColorButton';

export const ParticipantsShowQuestion = (_: SidebarSectionProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{i18n.question.stateShowQuestion}</h6>
            <span className="material-symbols-outlined badge rounded-pill text-bg-primary fs-2">
                lock_clock
            </span>
        </div>
    );
};

export const ParticipantsBuzzerActive = (_: SidebarSectionProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{i18n.question.stateBuzzerEnabled}</h6>
            <span className="material-symbols-outlined badge rounded-pill text-bg-danger fs-2">
                e911_emergency
            </span>
        </div>
    );
};

export const ParticipantsTeamCanAttempt = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="card-body">
            <h6>{i18n.question.stateTeamCanAttempt}</h6>
            {
                Array.from(round.attemptingTeams)
                    .map((color) => (
                        <TeamColorButton key={color} color={color}>
                            <span
                                className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                            >
                                {i18n.teams[color]}
                            </span>
                        </TeamColorButton>
                    ))
            }
        </div>
    );
};

export const ParticipantsShowResults = ({ round }: SidebarSectionProps & RoundProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <>
            <div className="card-body">
                <h6>{i18n.question.stateQuestionComplete}</h6>
                <span className="material-symbols-outlined badge rounded-pill text-bg-primary fs-2">
                    task_alt
                </span>
            </div>
            <div className="card-body">
                <h6>{round.question.completedBy.size === 0 ? i18n.question.noWinners : i18n.question.teamsWon}</h6>
                {
                    Array.from(round.question.completedBy)
                        .map((color) => (
                            <TeamColorButton key={color} color={color}>
                                <span
                                    className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                                >
                                    {i18n.teams[color]}
                                </span>
                            </TeamColorButton>
                        ))
                }
            </div>
        </>
    );
};
