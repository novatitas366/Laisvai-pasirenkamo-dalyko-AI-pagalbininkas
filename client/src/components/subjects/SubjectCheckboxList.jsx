import SubjectCheckboxItem from './SubjectCheckboxItem'

export default function SubjectCheckboxList({ subjects, selectedIds, onToggle }) {
  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <SubjectCheckboxItem
          key={subject.id}
          subject={subject}
          checked={selectedIds.includes(subject.id)}
          onChange={onToggle}
        />
      ))}
    </div>
  )
}
