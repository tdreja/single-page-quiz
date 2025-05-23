import { QuestionType } from '../../model/quiz/question';

type ByQuestionType<VALUE> = {
    [type in QuestionType]: VALUE;
};

// 'action_key'
// 'score'
export const QuestionTypeIcons: ByQuestionType<string> = {
    [QuestionType.TEXT_MULTIPLE_CHOICE]: 'widget_width',
    [QuestionType.IMAGE_MULTIPLE_CHOICE]: 'image_search',
    [QuestionType.ESTIMATE]: 'search_insights',
    [QuestionType.ACTION]: 'person_play',
};
