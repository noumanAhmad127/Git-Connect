# Database Models

## Model Relationships

```
User ──has_many──▶ Post
User ──has_many──▶ Comment
Post ──has_many──▶ Comment
User ──follows──▶ User (self-referential)
Activity ──polymorphic──▶ User | Post | Comment
Notification ──belongs_to──▶ User
Message ──between──▶ User ↔ User
Report ──polymorphic──▶ User | Post | Comment
```

## Index Strategy

Every model has indexes on:
- Fields used in `find()` queries (e.g., `author`, `post`)
- Fields used in `sort()` (e.g., `createdAt`)
- Fields used in lookups/joins (e.g., `recipient`)

Denormalized fields (`likeCount`, `commentCount`) eliminate expensive `count()` queries on large collections.

## Polymorphic Associations

Mongoose `refPath` is used for the Activity feed — the `targetModel` field determines which collection `target` references. This is the Mongoose equivalent of Rails' polymorphic associations.

## Self-Referential Association

The User model's `followers` and `following` arrays are arrays of ObjectId references to other User documents. This is the MERN pattern for Rails' `has_many :through` self-join.
