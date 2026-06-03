document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const filterUnsubmitted = document.getElementById('filter-unsubmitted');

    // LocalStorageからデータを取得
    let tasks = JSON.parse(localStorage.getItem('tasks_v2')) || [];

    // LocalStorageにデータを保存
    const saveTasks = () => {
        localStorage.setItem('tasks_v2', JSON.stringify(tasks));
    };

    // 残り日数を計算
    const getRemainingDays = (deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // 優先度のラベルを取得
    const getPriorityLabel = (priority) => {
        switch(priority) {
            case 'high': return '高';
            case 'medium': return '中';
            case 'low': return '低';
            default: return '不明';
        }
    };

    // 日付をフォーマット
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // 課題を画面に描画
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        // 締切日の昇順（近い順）でソート
        let sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        // 「未提出のみ表示」のフィルタリング
        if (filterUnsubmitted.checked) {
            sortedTasks = sortedTasks.filter(task => !task.isSubmitted);
        }

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 30px; background: var(--card-bg); border-radius: var(--radius);">表示する課題がありません。新しい課題を追加してください！</p>';
            return;
        }

        sortedTasks.forEach(task => {
            const diffDays = getRemainingDays(task.deadline);
            
            // 3日以内かつ未提出の場合は強調表示（urgent）
            const isUrgent = diffDays >= 0 && diffDays <= 3 && !task.isSubmitted;
            const isOverdue = diffDays < 0 && !task.isSubmitted;

            let remainingText = '';
            if (task.isSubmitted) {
                remainingText = '提出済み';
            } else if (diffDays === 0) {
                remainingText = '🔥 本日締切！';
            } else if (diffDays < 0) {
                remainingText = `⚠️ 締切超過 (${Math.abs(diffDays)}日)`;
            } else {
                remainingText = `残り ${diffDays} 日`;
            }

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${isUrgent || isOverdue ? 'urgent' : ''} ${task.isSubmitted ? 'submitted' : ''}`;
            
            taskItem.innerHTML = `
                <div class="task-header">
                    <div class="task-title ${task.isSubmitted ? 'submitted-text' : ''}">
                        ${task.name}
                        <span class="priority-badge priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                    </div>
                </div>
                
                <div class="task-details">
                    <div>
                        <strong>📅 締切:</strong> ${formatDate(task.deadline)}
                    </div>
                    <div class="remaining-days">
                        ${remainingText}
                    </div>
                    ${task.submission ? `<div><strong>📦 提出物:</strong> ${task.submission}</div>` : ''}
                </div>

                ${task.memo ? `<div class="task-memo">${task.memo.replace(/\n/g, '<br>')}</div>` : ''}

                <div class="task-actions">
                    <label class="status-toggle">
                        <input type="checkbox" class="toggle-status-btn" data-id="${task.id}" ${task.isSubmitted ? 'checked' : ''}>
                        ${task.isSubmitted ? '提出済み' : '未提出'}
                    </label>
                    <button class="btn-delete" data-id="${task.id}">削除</button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });

        // ステータス変更のイベントリスナー
        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                toggleTaskStatus(id);
            });
        });

        // 削除ボタンのイベントリスナー
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteTask(id);
            });
        });
    };

    // 新規課題の追加
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('task-name').value;
        const deadline = document.getElementById('task-deadline').value;
        const submission = document.getElementById('task-submission').value;
        const priority = document.getElementById('task-priority').value;
        const memo = document.getElementById('task-memo').value;

        const newTask = {
            id: Date.now().toString(),
            name,
            deadline,
            submission,
            priority,
            memo,
            isSubmitted: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // フォームをリセットし、優先度をデフォルトの「中」に戻す
        taskForm.reset();
        document.getElementById('task-priority').value = 'medium';
    });

    // 課題のステータス切り替え
    const toggleTaskStatus = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.isSubmitted = !task.isSubmitted;
            saveTasks();
            renderTasks();
        }
    };

    // 課題の削除
    const deleteTask = (id) => {
        if (confirm('この課題を削除してもよろしいですか？')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    // フィルターの切り替えイベント
    filterUnsubmitted.addEventListener('change', renderTasks);

    // 初期描画
    renderTasks();
});
