const ctx = document.getElementById('brandChart');

$.ajax({
    url: '/api/brandChart',
    type: 'GET',
    dataType: "json",
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },
    success: function (data) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 1)',
                    backgroundColor: [
                        'rgba(0, 0, 0, 0.5)',
                        'rgba(207, 141, 46, 0.5)',
                        'rgba(248, 18, 26, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(201, 203, 207, 0.5)'
                    ],
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                plugins: {
                    datalabels: {
                        color: 'black',
                        labels: {
                            title: {
                                font: {
                                    size: 15,
                                },
                            },
                        }
                    }
                },
                maintainAspectRatio: false,
                responsive: true,
            }
        });
    },
    error: function () {

    }
})

let dataTable = $('#brandsTable').DataTable({
    ajax: {
        url: '/api/brandTable',
        dataSrc: ''
    },
    responsive: true,
    autoWidth: false,
    dom: 'Bfrtip',
    buttons: [
        'copyHtml5',
        'excelHtml5',
        'csvHtml5',
        'pdfHtml5'
    ],
    columns: [
        {
            data: 'id'
        },

        {
            data: null,
            render: function (data) {
                return `<img src="${data.img_path}" width="100" height="100" />`;
            }
        },

        {
            data: 'brand_name'
        },

        {
            data: null,
            render: function (data) {
                return `<button type="button" data-bs-toggle="modal" data-bs-target="#brandModal" data-id="${data.id}" class="btn btn-primary edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" data-id="${data.id}" class="btn btn-danger btn-delete delete">
                    <i class="fas fa-trash" style="color:white"></i>
                </button>`;
            }
        }
    ]
});

$('#create').on('click', function () {
    $('#update').hide();
    $('#save').show();
    $.ajax({
        url: "/api/brand/create",
        type: "GET",
        dataType: "json",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (data) {
            $('#brandForm').trigger('reset')
        },
        error: function (error) {
            alert("error");
        },
    })
})

$('#save').on('click', function () {
    let formData = new FormData($('#brandForm')[0]);
    // for (var pair of formData.entries()) {
    //     console.log(pair[0] + ', ' + pair[1]);
    // }
    $.ajax({
        url: "/api/brand/store",
        type: "POST",
        dataType: "json",
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (data) {
            $('#brandModal *').prop('disabled', false);
            $('#brandForm').trigger('reset')
            $('#brandModal').modal('hide')
            dataTable.ajax.reload();

            $('.for-alert').prepend(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Brand Successfully Created!
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);

            $('.alert').fadeOut(5000, function () {
                $(this).remove();
            });
        },
        error: function (error) {
            alert("error");
        },
    })
})

$(document).on('click', 'button.edit', function () {
    $('#save').hide();
    $('#update').show();
    $('input[name="document[]"]').remove();

    let id = $(this).attr('data-id');
    $('#update').attr('data-id', id);
    $.ajax({
        url: `/api/brand/edit/${id}`,
        type: "GET",
        dataType: "json",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (data) {
            $('#brand_name').val(data.brand.brand_name);
        },
        error: function (error) {
            alert("error");
        },
    })
});

$('#update').on('click', function (event) {
    let id = $(this).attr('data-id');
    let formData = new FormData($('#brandForm')[0]);
    // for (var pair of formData.entries()) {
    //     console.log(pair[0] + ', ' + pair[1]);
    // }
    formData.append('_method', 'PUT');
    $('#brandModal *').prop('disabled', true);

    $.ajax({
        url: `/api/brand/update/${id}`,
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        dataType: "json",
        success: function (data, status) {
            $('#brandModal').modal("hide");
            $('#brandModal *').prop('disabled', false);
            $('#brandModal').trigger("reset");
            $('input[name="document[]"]').remove();
            dataTable.ajax.reload();

            $('.for-alert').prepend(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                Brand Successfully Updated!
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);

            $('.alert').fadeOut(5000, function () {
                $(this).remove();
            });
        },
        error: function (error) {
            console.log(error.responseJSON.errors);
            alert("error");
        }
    })
})

$(document).on('click', 'button.delete', function () {
    let id = $(this).attr("data-id");
    $.confirm({
        title: 'Delete Brand',
        content: 'Do you want to delete this brand?',
        buttons: {
            confirm: function () {
                $.ajax({
                    url: `/api/brand/delete/${id}`,
                    type: 'DELETE',
                    dataType: "json",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (data) {
                        $('.for-alert').prepend(`
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            Brand Successfully Deleted!
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    `);
                        $('.alert').fadeOut(5000, function () {
                            $(this).remove();
                        });
                        $(`td:contains(${id})`).closest('tr').fadeOut(5000, function () {
                            $(this).remove();
                        });
                    },
                    error: function () {
                        alert('error')
                    }
                })
            },

            cancel: function () {
            },
        }
    });
});

$(function () {
    $("#brandForm").validate({
        errorElement: "small",
        rules: {
            img_path: {
                required: true,
            },
            brand_name: {
                required: true,
                minlength: 2,
            },
        },
        messages: {
            img_path: {
                required: "Please select an image.",
            },
            brand_name: {
                required: "Please enter a brand name.",
                minlength: "Brand name must be at least 2 characters.",
            },
        },
        submitHandler: function (form) {
        },
    });

    $("#save").click(function () {
        $("#brandForm").submit();
    });

    $("#close").click(function () {
        $("#brandForm").find("small").remove();
    });
});

$('#import').on('click', function () {

    let formData = new FormData($('#importForm')[0]);

    $.ajax({
        url: '/api/brand/import',
        type: "POST",
        contentType: false,
        processData: false,
        data: formData,
        dataType: "json",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (data) {
            dataTable.ajax.reload()
            $('#importModal').modal('hide');
            $('#buttonClose').trigger('click');
            $('#importForm').trigger('reset');
            $('.for-alert').prepend(
                `<div class="alert alert-success alert-dismissible fade show" role="alert">
                    Successfully Imported!
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);
            $('.alert').fadeOut(5000, function () {
                $(this).remove();
            });
        },
        error: function () {
            $('#importForm').trigger('reset');
            $('#importModal').modal("hide");
            $('.for-alert').prepend(`
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    Please Import Excel Only
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);
            $('.alert').fadeOut(5000, function () {
                $(this).remove();
            });
        }
    })
})

$("#importFile").on("change", function (e) {
    let filename = e.target.files[0].name;
    $('#labelFile').html(filename);
})